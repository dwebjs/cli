module.exports = {
    name: 'create',
    command: create,
    help: [
        'Create an empty dWeb vault and dweb.json',
        '',
        'Usage: dat create [directory]'
    ].join('\n'),
    options: [{
            name: 'yes',
            boolean: true,
            default: false,
            abbr: 'y',
            help: 'Skip dweb.json creation.'
        },
        {
            name: 'title',
            help: 'the title property for dweb.json'
        },
        {
            name: 'description',
            help: 'the description property for dweb.json'
        }
    ]
}

function create(opts) {
    var path = require('path')
    var fs = require('fs')
    var DWeb = require('@dwebjs/core')
    var output = require('neat-log/output')
    var DWebJson = require('@dwebjs/metadata')
    var prompt = require('prompt')
    var chalk = require('chalk')
    var parseArgs = require('../parse-args')
    var debug = require('debug')('@dwebjs/cli')

    debug('dweb create')
    if (!opts.dir) {
        opts.dir = parseArgs(opts).dir || process.cwd()
    }

    var welcome = `Welcome to ${chalk.green(`dweb`)} program!`
  var intro = output(`
    You can turn any folder on your computer into a dWeb vault.
    A dWeb vault is a folder with some magic.

    Your dWeb vault is ready!
    We will walk you through creating a 'dweb.json' file.
    (You can skip dweb.json and get started now.)

    Learn more about dweb.json: ${chalk.blue(`https://github.com/dwebjs/metadata`)}

    ${chalk.dim('Ctrl+C to exit at any time')}

  `)
  var outro

  // Force certain options
  opts.errorIfExists = true

  console.log(welcome)
  DWeb(opts.dir, opts, function (err, dweb) {
    if (err && err.name === 'ExistsError') return exitErr('\nArchive already exists.\nYou can use `dat sync` to update.')
    if (err) return exitErr(err)

    outro = output(`

      Created empty dWeb vault in ${dweb.path}/.dweb

      Now you can add files and share:
      * Run ${chalk.green(`dweb share`)} to create metadata and sync.
      * Copy the unique dweb link and securely share it.

      ${chalk.blue(`dweb://${dweb.key.toString('hex')}`)}
    `)

    if (opts.yes) return done()

    console.log(intro)
    var dwebjson = DWebJson(dweb.vault, { file: path.join(opts.dir, 'dweb.json') })
    fs.readFile(path.join(opts.dir, 'dweb.json'), 'utf-8', function (err, data) {
      if (err || !data) return doPrompt()
      data = JSON.parse(data)
      debug('read existing dweb.json data', data)
      doPrompt(data)
    })

    function doPrompt (data) {
      if (!data) data = {}

      var schema = {
        properties: {
          title: {
            description: chalk.magenta('Title'),
            default: data.title || '',
            // pattern: /^[a-zA-Z\s\-]+$/,
            // message: 'Name must be only letters, spaces, or dashes',
            required: false
          },
          description: {
            description: chalk.magenta('Description'),
            default: data.description || ''
          }
        }
      }

      prompt.override = { title: opts.title, description: opts.description }
      prompt.message = '' // chalk.green('> ')
      // prompt.delimiter = ''
      prompt.start()
      prompt.get(schema, writeDWebJson)

      function writeDWebJson (err, results) {
        if (err) return exitErr(err) // prompt error
        if (!results.title && !results.description) return done()
        dwebjson.create(results, done)
      }
    }

    function done (err) {
      if (err) return exitErr(err)
      console.log(outro)
    }
  })

  function exitErr (err) {
    if (err && err.message === 'canceled') {
      console.log('')
      console.log(outro)
      process.exit(0)
    }
    console.error(err)
    process.exit(1)
  }
}