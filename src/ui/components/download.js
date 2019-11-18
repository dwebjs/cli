var output = require('neat-log/output')
var bar = require('progress-string')

module.exports = networkUI

function networkUI(state) {
    var stats = state.stats.get()
    var download = state.download
    if (!stats || !download) return ''

    var title = 'Downloading updates...'
    var downBar = makeBar()

    if (download.nsync) {
        if (state.opts.exit && state.dweb.vault.version === 0) {
            return 'dWeb vault synced. There is no content in this vault.'
        }
        if (state.opts.exit && download.modified) {
            return `dWeb vault sync complete.\nVersion ${stats.version}`
        }

        if (!download.modified && state.opts.exit) {
            title = `dWeb vault already in sync, waiting for updates.`
        } else {
            title = `dWeb vault synced, waiting for updates.`
        }
    }

    if (state.opts.exit) {
        title = `dWeb vault synced, exiting in ${state.opts.exit} seconds.`
    }

    if (!stats.downloaded || !stats.length) {
        return '' // no metadata yet
    }

    return output(`
    ${title}
    ${downBar(stats.downloaded)}
  `)

    function makeBar() {
        var total = stats.length
        return bar({
            total: total,
            style: function(a, b) {
                return `[${a}${b}] ${(100 * stats.downloaded / total).toFixed(2)}%`
            }
        })
    }
}