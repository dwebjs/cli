module.exports = function(opts, help, usage) {
    if (opts.version) {
        var pkg = require('../package.json')
        console.error(pkg.version)
        process.exit(1)
    }
    var msg = `
Usage: dweb <cmd> [<dir>] [options]

Sharing Files:
dweb share                   create dWeb vault, import files, share to network
dweb create                  create empty dWeb vault and dweb.json
   dweb sync                    import files to existing dWeb vault & sync with network

Downloading Files:
dweb clone <link> [<dir>]    download a dWeb vault via link to <dir>
dweb pull                    update dWeb vault & exit
   dweb sync                    live sync files with the network

Info:
dweb log                     log history for a dWeb vault
dweb status                  get key & info about a local dWeb vault

DWeb public registries:
   dweb <cmd> [<repository>]      All commands take <repository> option
   dweb register                register new account
   dweb login                   login to your account
   dweb publish                 publish a dWeb vault
   dweb whoami                  print active login information
   dweb logout                  logout from active login

Stateless/Shortcut Commands:
dweb <link> [<dir>]          clone or sync link to <dir>
dweb <dir>                   create and sync dWeb vault in directory

Troubleshooting & Help:
dweb satoshi                  run the dweb network doctor
dweb help                    print this usage guide
dweb <command> --help, -h    print help for a specific command
dweb --version, -v           print the dweb version

  `
    console.error(msg)
    if (usage) {
        console.error('General Options:')
        console.error(usage)
    }
    console.error('Have fun using dWeb CLI! Learn more at dwebuniversity.com')
    process.exit(1)
}