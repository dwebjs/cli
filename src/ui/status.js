var output = require('neat-log/output')
var stringKey = require('@dwebjs/encoding').toStr
var pretty = require('prettier-bytes')
var chalk = require('chalk')

module.exports = statusUI

function statusUI(state) {
    if (!state.dweb) return 'Starting dWeb CLI...'

    var dweb = state.dweb
    var stats = dweb.stats.get()

    return output(`
    ${chalk.blue('dweb://' + stringKey(dweb.key))}
    ${stats.files} files (${pretty(stats.byteLength)})
    Version: ${chalk.bold(stats.version)}
  `)
}