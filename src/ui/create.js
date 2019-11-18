var output = require('neat-log/output')
var pretty = require('prettier-bytes')
var chalk = require('chalk')
var importUI = require('./components/import-progress')
var keyEl = require('./elements/key')
var pluralize = require('./elements/pluralize')

module.exports = createUI

function createUI(state) {
    if (!state.dweb) {
        return output(`
        Creating a dWeb vault! Add information to your dweb.json file:
  `)
    }

    var dweb = state.dweb
    var stats = dweb.stats.get()
    var title = '\n'
    var progressView
    var exitMsg = `
    Your dWeb is created! Run ${chalk.green('dweb sync')} to share:
    ${keyEl(dweb.sync)}
  `
    if (!state.opts.import) {
        // set exiting right away
        state.exiting = true
    }

    if (!state.exiting) {
        // Only show key if not about to exit
        title = `${keyEl(dweb.sync)}\n`
    }
    if (state.title) title += state.title

    if (stats.version > 0) title += `: ${stats.files} ${pluralize('file', stats.files)} (${pretty(stats.byteLength)})`
    else if (stats.version === 0) title += ': (empty vault)'

    if (state.opts.import) {
        progressView = importUI(state) + '\n'
    } else {
        progressView = 'Not importing files.'
    }

    return output(`
    ${title}

    ${progressView}
    ${state.exiting ? exitMsg : chalk.dim('Ctrl+C to Exit')}
  `)
}