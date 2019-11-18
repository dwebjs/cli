var stringKey = require('@dwebjs/encoding').toStr
var chalk = require('chalk')

module.exports = function(key) {
        return `${chalk.blue(`dweb://${stringKey(key)}`)}`
}