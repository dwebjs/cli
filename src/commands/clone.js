module.exports = {
    name: 'clone',
    command: clone,
    help: [
        'Clone a remote dWeb vault',
        '',
        'Usage: dweb clone <link> [download-folder]'
    ].join('\n'),
    options: [{
            name: 'empty',
            boolean: false,
            default: false,
            help: 'Do not download files by default. Files must be synced manually.'
        },
        {
            name: 'upload',
            boolean: true,
            default: true,
            help: 'announce your address on link (improves connection capability) and upload data to other downloaders.'
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

function clone(opts) {
    var fs = require('fs')
    var path = require('path')
    var rimraf = require('rimraf')
    var DWeb = require('@dwebjs/core')
    var linkResolve = require('@dwebjs/resolve')
    var neatLog = require('neat-log')
    var vaultUI = require('../ui/vault')
    var trackVault = require('../lib/vault')
    var revelationExit = require('../lib/revelation-exit')
    var onExit = require('../lib/exit')
    var parseArgs = require('../parse-args')
    var debug = require('debug')('@dwebjs/cli')

    var parsed = parseArgs(opts)
    opts.key = parsed.key || opts._[0] // pass other links to resolver
    opts.dir = parsed.dir
    opts.showKey = opts['show-key'] // using abbr in option makes printed help confusing
    opts.sparse = opts.empty

    debug('clone()')

    // cmd: dweb /path/to/dweb.json (opts.key is path to dweb.json)
    if (fs.existsSync(opts.key)) {
        try {
            opts.key = getDWebJsonKey()
        } catch (e) {
            debug('error reading dweb.json key', e)
        }
    }

    debug(Object.assign({}, opts, { key: '<private>', _: null })) // don't show key

    var neat = neatLog(vaultUI, { logspeed: opts.logspeed, quiet: opts.quiet, debug: opts.debug })
    neat.use(trackVault)
    neat.use(revelationExit)
    neat.use(onExit)
    neat.use(function(state, bus) {
        if (!opts.key) return bus.emit('exit:warn', 'key required to clone')

        state.opts = opts
        var createdDirectory = null // so we can delete directory if we get error

        // Force these options for clone command
        opts.exit = (opts.exit !== false)
            // opts.errorIfExists = true // TODO: do we want to force this?

        linkResolve(opts.key, function(err, key) {
            if (err && err.message.indexOf('Invalid key') === -1) return bus.emit('exit:error', 'Could not resolve link')
            else if (err) return bus.emit('exit:warn', 'Link is not a valid dWeb link.')

            opts.key = key
            createDir(opts.key, function() {
                bus.emit('key', key)
                runDWeb()
            })
        })

        function createDir(key, cb) {
            debug('Checking directory for clone')
                // Create the directory if it doesn't exist
                // If no dir is specified, we put dweb in a dir with name = key
            if (!opts.dir) opts.dir = key
            if (!Buffer.isBuffer(opts.dir) && typeof opts.dir !== 'string') {
                return bus.emit('exit:error', 'Directory path must be a string or Buffer')
            }
            fs.access(opts.dir, fs.F_OK, function(err) {
                if (!err) {
                    createdDirectory = false
                    return cb()
                }
                debug('No existing directory, creating it.')
                createdDirectory = true
                fs.mkdir(opts.dir, cb)
            })
        }

        function runDWeb() {
            DWeb(opts.dir, opts, function(err, dweb) {
                if (err && err.name === 'ExistsError') return bus.emit('exit:warn', 'Existing vault in this directory. Use pull or sync to update.')
                if (err) {
                    if (createdDirectory) rimraf.sync(dweb.path)
                    return bus.emit('exit:error', err)
                }
                if (dweb.writable) return bus.emit('exit:warn', 'Vault is writable. Cannot clone your own vault =).')

                state.dweb = dweb
                state.title = 'Cloning'
                bus.emit('@dwebjs/cli')
                bus.emit('render')
            })
        }
    })

    function getDWebJsonKey() {
        var dwebPath = opts.key
        var stat = fs.lstatSync(dwebPath)

        if (stat.isDirectory()) dwebPath = path.join(dwebPath, 'dweb.json')

        if (!fs.existsSync(dwebPath) || path.basename(dwebPath) !== 'dweb.json') {
            if (stat.isFile()) throw new Error('must specify existing dweb.json file to read key')
            throw new Error('directory must contain a dweb.json')
        }

        debug('reading key from dweb.json:', dwebPath)
        return JSON.parse(fs.readFileSync(dwebPath, 'utf8')).url
    }
}