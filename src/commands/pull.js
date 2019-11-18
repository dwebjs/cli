module.exports = {
    name: 'pull',
    command: pull,
    help: [
        'Pull updates from a cloned dWeb vault',
        '',
        'Usage: dweb pull'
    ].join('\n'),
    options: [{
            name: 'exit',
            boolean: false,
            help: 'exit after specified number of seconds (gives the dweb network time to find updates). defaults to 12 seconds.'
        },

        {
            name: 'upload',
            boolean: true,
            default: true,
            help: 'announce your address on link (improves connection capability) and upload data to other downloaders.'
        },
        {
            name: 'selectFromFile',
            boolean: false,
            default: '.dwebdownload',
            help: 'Sync only the list of selected files or directories in the given file.',
            abbr: 'select-from-file'
        },
        {
            name: 'select',
            boolean: false,
            default: false,
            help: 'Sync only the list of selected files or directories.'
        },
        {
            name: 'show-key',
            boolean: true,
            default: false,
            abbr: 'k',
            help: 'print out the dweb key'
        }
    ]
}

function pull(opts) {
    var DWeb = require('@dwebjs/core')
    var neatLog = require('neat-log')
    var vaultUI = require('../ui/vault')
    var trackVault = require('../lib/vault')
    var selectiveSync = require('../lib/selective-sync')
    var revelationExit = require('../lib/revelation-exit')
    var onExit = require('../lib/exit')
    var parseArgs = require('../parse-args')
    var debug = require('debug')('dweb')

    debug('dweb pull')
    if (!opts.dir) {
        var parsed = parseArgs(opts)
        opts.key = parsed.key
        opts.dir = parsed.dir || process.cwd()
    }

    opts.showKey = opts['show-key'] // using abbr in option makes printed help confusing

    // Force these options for pull command
    opts.createIfMissing = false

    // If --exit is specified without a number of seconds, default to 12
    if (opts.exit === true) {
        opts.exit = 12
    }

    var neat = neatLog(vaultUI, { logspeed: opts.logspeed, quiet: opts.quiet, debug: opts.debug })
    neat.use(trackVault)
    neat.use(revelationExit)
    neat.use(onExit)
    neat.use(function(state, bus) {
        state.opts = opts
        selectiveSync(state, opts)

        DWeb(opts.dir, opts, function(err, dweb) {
            if (err && err.name === 'MissingError') return bus.emit('exit:warn', 'No existing vault in this directory. Use clone to download a new vault.')
            if (err) return bus.emit('exit:error', err)
            if (dweb.writable) return bus.emit('exit:warn', 'Vault is writable. Cannot pull your own vault.')

            state.dweb = dweb
            bus.emit('dweb')
            bus.emit('render')
        })
    })
}