module.exports = {
    name: 'status',
    command: status,
    help: [
        'Get information on about the dWeb vault in a directory.',
        '',
        'Usage: dweb status'
    ].join('\n'),
    options: []
}

function status(opts) {
    var DWeb = require('@dwebjs/core')
    var neatLog = require('neat-log')
    var statusUI = require('../ui/status')
    var onExit = require('../lib/exit')
    var parseArgs = require('../parse-args')
    var debug = require('debug')('@dwebjs/cli')

    debug('dweb status')
    if (!opts.dir) {
        opts.dir = parseArgs(opts).dir || process.cwd()
    }
    opts.createIfMissing = false // sync must always be a resumed vault

    var neat = neatLog(statusUI, { logspeed: opts.logspeed, quiet: opts.quiet, debug: opts.debug })
    neat.use(onExit)
    neat.use(function(state, bus) {
        state.opts = opts

        DWeb(opts.dir, opts, function(err, dweb) {
            if (err && err.name === 'MissingError') return bus.emit('exit:warn', 'Sorry, could not find a dWeb vault in this directory.')
            if (err) return bus.emit('exit:error', err)

            state.dweb = dweb
            var stats = dweb.trackStats()
            if (stats.get().version === dweb.version) return exit()
            stats.on('update', function() {
                if (stats.get().version === dweb.version) return exit()
            })

            function exit() {
                bus.render()
                process.exit(0)
            }
        })
    })
}