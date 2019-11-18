var test = require('tape')
var ram = require('random-access-memory')
var DWeb = require('..')

test('@dwebjs/core: require @dwebjs/core + make a dWeb vault', function(t) {
    DWeb(ram, function(err, dweb) {
        t.error(err, 'no error')
        t.ok(dweb, 'makes dweb vault')
        t.pass('yay')
        t.end()
    })
})