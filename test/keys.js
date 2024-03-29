var fs = require('fs')
var path = require('path')
var test = require('tape')
var rimraf = require('rimraf')
var tempDir = require('temporary-directory')
var spawn = require('./helpers/spawn.js')
var help = require('./helpers')

var dweb = path.resolve(path.join(__dirname, '..', 'bin', 'cli.js'))
var fixtures = path.join(__dirname, 'fixtures')

test('keys - print keys', function(t) {
    help.shareFixtures(function(_, shareDWeb) {
        shareDWeb.close(function() {
            var cmd = dweb + ' keys '
            var st = spawn(t, cmd, { cwd: fixtures })

            st.stdout.match(function(output) {
                if (output.indexOf('dweb://') === -1) return false
                t.ok(output.indexOf(shareDWeb.key.toString('hex') > -1), 'prints key')
                st.kill()
                return true
            })
            st.stderr.empty()
            st.end()
        })
    })
})

test('keys - print revelation key', function(t) {
    help.shareFixtures(function(_, shareDWeb) {
        shareDWeb.close(function() {
            var cmd = dweb + ' keys --revelation'
            var st = spawn(t, cmd, { cwd: fixtures })

            st.stdout.match(function(output) {
                if (output.indexOf('Revelation') === -1) return false
                t.ok(output.indexOf(shareDWeb.key.toString('hex') > -1), 'prints key')
                t.ok(output.indexOf(shareDWeb.vault.revelationKey.toString('hex') > -1), 'prints revelation key')
                st.kill()
                return true
            })
            st.stderr.empty()
            st.end()
        })
    })
})

if (!process.env.TRAVIS) {
    test('keys - export & import secret key', function(t) {
        help.shareFixtures(function(_, shareDWeb) {
            var key = shareDWeb.key.toString('hex')
            tempDir(function(_, dir, cleanup) {
                var cmd = dweb + ' clone ' + key
                var st = spawn(t, cmd, { cwd: dir, end: false })
                var dwebDir = path.join(dir, key)

                st.stdout.match(function(output) {
                    var downloadFinished = output.indexOf('Exiting') > -1
                    if (!downloadFinished) return false
                    st.kill()
                    shareDWeb.close(exchangeKeys)
                    return true
                })
                st.stderr.empty()

                function exchangeKeys() {
                    var secretKey = null

                    var exportKey = dweb + ' keys export'
                    var st = spawn(t, exportKey, { cwd: fixtures, end: false })
                    st.stdout.match(function(output) {
                        if (!output) return false
                        secretKey = output.trim()
                        st.kill()
                        importKey()
                        return true
                    })
                    st.stderr.empty()

                    function importKey() {
                        var exportKey = dweb + ' keys import'
                        var st = spawn(t, exportKey, { cwd: dwebDir })
                        st.stdout.match(function(output) {
                            if (!output.indexOf('secret key') === -1) return false
                            st.stdin.write(secretKey + '\r')
                            if (output.indexOf('Successful import') === -1) return false
                            t.ok(fs.statSync(path.join(dwebDir, '.dweb', 'metadata.ogd')), 'original dweb file exists')
                            st.kill()
                            return true
                        })
                        st.stderr.empty()
                        st.end(function() {
                            rimraf.sync(path.join(fixtures, '.dweb'))
                            cleanup()
                        })
                    }
                }
            })
        })
    })
}