module.exports = {
    name: 'login',
    command: login,
    help: [
        'Login to a dWeb repository server',
        'Usage: dweb login [<repository>]',
        '',
        'Publish your dWeb vaults so other users can discovery them.',
        'Please register before trying to login.'
    ].join('\n'),
    options: [{
        name: 'server',
        help: 'Your dWeb repository server (must be registered to login).'
    }]
}

function login(opts) {
    var prompt = require('prompt')
    var output = require('neat-log/output')
    var chalk = require('chalk')
    var Repository = require('../../repository')

    if (opts._[0]) opts.server = opts._[0]
    var welcome = output(`
    Welcome to ${chalk.green(`dweb`)} program!
    Login to Publish your dWeb vaults.

  `)
  console.log(welcome)

  var schema = {
    properties: {
      server: {
        description: chalk.magenta('dWeb repository'),
        default: opts.server || 'dweb.network',
        required: true
      },
      email: {
        description: chalk.magenta('Email'),
        message: 'Email required',
        required: true
      },
      password: {
        description: chalk.magenta('Password'),
        message: 'Password required',
        required: true,
        hidden: true,
        replace: '*'
      }
    }
  }

  prompt.override = opts
  prompt.message = ''
  prompt.start()
  prompt.get(schema, function (err, results) {
    if (err) return exitErr(err)
    opts.server = results.server
    makeRequest(results)
  })

  function makeRequest (user) {
    var client = Repository(opts)
    client.login({
      email: user.email,
      password: user.password
    }, function (err, resp, body) {
      if (err && err.message) return exitErr(err.message)
      else if (err) return exitErr(err.toString())

      console.log(output(`
        Logged you in to ${chalk.green(opts.server)}!

        Now you can publish dWeb vaults and share:
        * Run ${chalk.green(`dweb publish`)} to publish a dWeb vault!
        * View & Share your dWeb vaults at ${opts.server}
      `))
      process.exit(0)
    })
  }
}

function exitErr (err) {
  console.error(err)
  process.exit(1)
}