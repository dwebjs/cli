var xtend = Object.assign
var RepositoryClient = require('@dwebjs/repository')

module.exports = function(opts) {
    var townshipOpts = {
        server: opts.server,
        config: {
            filepath: opts.config // defaults to ~/.dwebrc via @dwebjs/repository
        }
    }
    var defaults = {
        // xtend doesn't overwrite when key is present but undefined
        // If we want a default, make sure it's not going to passed as undefined
    }
    var options = xtend(defaults, townshipOpts)
    return RepositoryClient(options)
}