var output = require('neat-log/output')

module.exports = revelationExit

function revelationExit(state, bus) {
    bus.once('network:callback', checkExit)

    function checkExit() {
        if (state.dweb.network.connected || !state.opts.exit) return
        if (state.dweb.network.connecting) return setTimeout(checkExit, 500) // wait to see if any connections resolve
        var msg = output(`
        dWeb CLI could not find any connections for that link.
      There may not be any sources online.

      Run 'dweb satoshi' if you keep having trouble.
    `)
        bus.emit('exit:warn', msg)
    }
}