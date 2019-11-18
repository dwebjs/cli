module.exports = {
    name: 'unpublish',
    command: unpublish,
    options: [{
            name: 'server',
            help: 'Unpublish dWeb vault from this Repository.'
        },
        {
            name: 'confirm',
            default: false,
            boolean: true,
            abbr: 'y',
            help: 'Confirm you want to unpublish'
        }
    ]
}

function unpublish(opts) {
    var prompt = require('prompt')
    var path = require('path')
    var DWeb = require('@dwebjs/core')
    var output = require('neat-log/output')
    var chalk = require('chalk')
    var DWebJson = require('@dwebjs/metadata')
    var Repository = require('../repository')

    if (opts._[0]) opts.server = opts._[0]
    if (!opts.dir) opts.dir = process.cwd() // run in dir for `dweb unpublish`

    var client = Repository(opts)
    var whoami = client.whoami()
    if (!whoami || !whoami.token) {
        var loginErr = output(`
      Welcome to ${chalk.green(`dweb`)} program!

      ${chalk.bold('You must login before unpublishing.')}
      ${chalk.green('dweb login')}
    `)
    return exitErr(loginErr)
  }

  opts.createIfMissing = false // unpublish dont try to create new one
  DWeb(opts.dir, opts, function (err, dweb) {
    if (err) return exitErr(err)
    // TODO better error msg for non-existing vault
    if (!dweb.writable) return exitErr('Sorry, you can only publish a dWeb vault that you created.')

    var dwebjson = DWebJson(dweb.vault, { file: path.join(dweb.path, 'dweb.json') })
    dwebjson.read(function (err, data) {
      if (err) return exitErr(err)
      if (!data.name) return exitErr('Try `dweb unpublish <name>` with this dWeb vault, we are having trouble reading it.')
      confirm(data.name)
    })
  })

  function confirm (name) {
    console.log(`Unpublishing '${chalk.bold(name)}' from ${chalk.green(whoami.server)}.`)
    prompt.message = ''
    prompt.colors = false
    prompt.start()
    prompt.get([{
      name: 'sure',
      description: 'Are you sure? This cannot be undone. [y/n]',
      pattern: /^[a-zA-Z\s-]+$/,
      message: '',
      required: true
    }], function (err, results) {
      if (err) return console.log(err.message)
      if (results.sure === 'yes' || results.sure === 'y') makeRequest(name)
      else exitErr('Cancelled.')
    })
  }

  function makeRequest (name) {
    client.dwebs.delete({ name: name }, function (err, resp, body) {
      if (err && err.message) exitErr(err.message)
      else if (err) exitErr(err.toString())
      if (body.statusCode === 400) return exitErr(new Error(body.message))
      console.log(`Removed your dWeb vault from ${whoami.server}`)
      process.exit(0)
    })
  }
}

function exitErr (err) {
  console.error(err)
  process.exit(1)
}