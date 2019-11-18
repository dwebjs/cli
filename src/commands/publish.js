module.exports = {
    name: 'publish',
    command: publish,
    help: [
        'Publish your dWeb vault to a dWeb repository',
        'Usage: dweb publish [<repository>]',
        '',
        'By default it will publish to your active repository.',
        'Specify the server to change where the dWeb vault is published.'
    ].join('\n'),
    options: [{
        name: 'server',
        help: 'Publish dWeb vault to this repository. Defaults to active login.'
    }]
}

function publish(opts) {
    var path = require('path')
    var DWeb = require('@dwebjs/core')
    var encoding = require('@dwebjs/encoding')
    var output = require('neat-log/output')
    var prompt = require('prompt')
    var chalk = require('chalk')
    var DWebJson = require('@dwebjs/metadata')
    var xtend = Object.assign
    var Repository = require('../repository')

    if (!opts.dir) opts.dir = process.cwd()
    if (opts._[0]) opts.server = opts._[0]
    if (!opts.server) opts.server = 'datbase.org' // nicer error message if not logged in

    var client = Repository(opts)
    var whoami = client.whoami()
    if (!whoami || !whoami.token) {
        var loginErr = output(`
      Welcome to ${chalk.green(`dweb`)} program!
      Publish your dWeb vaults to ${chalk.green(opts.server)}.

      ${chalk.bold('Please login before publishing')}
      ${chalk.green('dweb login')}

      New to ${chalk.green(opts.server)} and need an account?
      ${chalk.green('dweb register')}

      Explore public dWeb vaults at ${chalk.blue('dweb.network/explore')}
    `)
    return exitErr(loginErr)
  }

  opts.createIfMissing = false // publish must always be a resumed vault
  DWeb(opts.dir, opts, function (err, dweb) {
    if (err && err.name === 'MissingError') return exitErr('No existing dWeb vault in this directory. Create a dWeb vault before publishing.')
    else if (err) return exitErr(err)

    dweb.joinNetwork() // join network to upload metadata

    var dwebjson = DWebJson(dweb.vault, { file: path.join(dweb.path, 'dweb.json') })
    dwebjson.read(publish)

    function publish (_, data) {
      // ignore dwebjson.read() err, we'll prompt for name

      // xtend dweb.json with opts
      var dwebInfo = xtend({
        name: opts.name,
        url: 'dweb://' + encoding.toStr(dweb.key), // force correct url in publish? what about non-dweb urls?
        title: opts.title,
        description: opts.description
      }, data)
      var welcome = output(`
      Publishing dWeb vault to ${chalk.green(opts.server)}!

      `)
      console.log(welcome)

      if (dwebInfo.name) return makeRequest(dwebInfo)

      prompt.message = ''
      prompt.start()
      prompt.get({
        properties: {
          name: {
            description: chalk.magenta('dweb vault name'),
            pattern: /^[a-zA-Z0-9-]+$/,
            message: `A dweb vault name can only have letters, numbers, or dashes.\n Like ${chalk.bold('cool-cats-12meow')}`,
            required: true
          }
        }
      }, function (err, results) {
        if (err) return exitErr(err)
        dwebInfo.name = results.name
        makeRequest(dwebInfo)
      })
    }

    function makeRequest (dwebInfo) {
      console.log(`Please wait, '${chalk.bold(dwebInfo.name)}' will soon be ready for its great unveiling...`)
      client.dwebs.create(dwebInfo, function (err, resp, body) {
        if (err) {
          if (err.message) {
            if (err.message === 'timed out') {
              return exitErr(output(`${chalk.red('\nERROR: ' + opts.server + ' could not connect to your computer.')}
              Troubleshoot here: ${chalk.green('https://dwebuniversity.com')}
              `))
            }
            var str = err.message.trim()
            if (str === 'jwt expired') return exitErr(`Session expired, please ${chalk.green('dweb login')} again`)
            return exitErr('ERROR: ' + err.message) // node error
          }

          // server response errors
          return exitErr('ERROR: ' + err.toString())
        }
        if (body.statusCode === 400) return exitErr(new Error(body.message))

        dwebjson.write(dwebInfo, function (err) {
          if (err) return exitErr(err)
          // TODO: write published url to dweb.json (need spec)
          var msg = output(`

            We ${body.updated === 1 ? 'updated' : 'published'} your dWeb vault!
            ${chalk.blue.underline(`${opts.server}/${whoami.username}/${dwebInfo.name}`)}
          `)// TODO: get url back? it'd be better to confirm link than guess username/dwebname structure

          console.log(msg)
          if (body.updated === 1) {
            console.log(output(`

              ${chalk.dim.green('Cool fact #21')}
              ${opts.server} will live update when you are sharing your dWeb vault!
              You only need to publish again if your dWeb link changes.
            `))
          } else {
            console.log(output(`

              Remember to use ${chalk.green('dweb share')} before sharing.
              This will make sure your dWeb vault is available.
            `))
          }
          process.exit(0)
        })
      })
    }
  })
}

function exitErr (err) {
  console.error(err)
  process.exit(1)
}