module.exports = {
    name: 'satoshi',
    help: [
        'Run a dWeb Network Check! Runs two tests:',
        '  1. Check if you can connect to a peer on a public server.',
        '  2. Gives you a link to test direct peer connections.',
        '',
        'Usage: dweb satoshi [<link>]'
    ].join('\n'),
    options: [],
    command: function(opts) {
        var satoshi = require('@dwebjs/satoshi')

        opts.peerId = opts._[0]
        satoshi(opts)
    }
}