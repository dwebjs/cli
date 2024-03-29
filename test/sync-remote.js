var path = require('path')
var test = require('tape')
var rimraf = require('rimraf')
var spawn = require('./helpers/spawn.js')
var help = require('./helpers')

var dweb = path.resolve(path.join(__dirname, '..', 'bin', 'cli.js'))
var baseTestDir = help.testFolder()
var shareDWeb
var syncDir

test('sync-remote - default opts', function(t) {
    // cmd: dweb sync
    var key

    help.shareFixtures({ import: false }, function(_, fixturesDWeb) {
        shareDWeb = fixturesDWeb
        key = shareDWeb.key.toString('hex')
        syncDir = path.join(baseTestDir, key)

        makeClone(function() {
            shareDWeb.importFiles(function() {
                var cmd = dweb + ' sync'
                var st = spawn(t, cmd, { cwd: syncDir })
                st.stdout.match(function(output) {
                    var updated = output.indexOf('Files updated') > -1
                    if (!updated) return false

                    var fileRe = new RegExp('3 files')
                    var bytesRe = new RegExp(/1\.\d{1,2} kB/)

                    key = help.matchLink(output)

                    t.ok(key, 'prints link')
                    t.ok(output.indexOf('dweb-download-folder/' + key) > -1, 'prints dir')
                    t.ok(output.match(fileRe), 'total size: files okay')
                    t.ok(output.match(bytesRe), 'total size: bytes okay')

                    st.kill()
                    return true
                })
                st.stderr.empty()
                st.end()
            })
        })
    })

    function makeClone(cb) {
        var cmd = dweb + ' clone ' + key
        var st = spawn(t, cmd, { cwd: baseTestDir, end: false })
        st.stdout.match(function(output) {
            var downloadFinished = output.indexOf('Download Finished') > -1
            if (!downloadFinished) return false

            st.kill()
            cb()
            return true
        })
        st.stderr.empty()
    }
})

test('sync-remote - shorthand sync', function(t) {
    // cmd: dweb sync
    var cmd = dweb + ' .'
    var st = spawn(t, cmd, { cwd: syncDir })
    st.stdout.match(function(output) {
        var syncing = output.indexOf('Syncing DWeb Vault') > -1
        if (!syncing) return false
        t.ok(help.matchLink(output), 'prints link')
        st.kill()
        return true
    })
    st.stderr.empty()
    st.end()
})

test('sync-remote - dir arg', function(t) {
    var cmd = dweb + ' ' + syncDir
    var st = spawn(t, cmd)
    st.stdout.match(function(output) {
        var syncing = output.indexOf('Syncing DWeb Vault') > -1
        if (!syncing) return false
        t.ok(help.matchLink(output), 'prints link')
        st.kill()
        return true
    })
    st.stderr.empty()
    st.end()
})

test('close sharer', function(t) {
    shareDWeb.close(function() {
        rimraf.sync(path.join(shareDWeb.path, '.dweb'))
        t.end()
    })
})

test.onFinish(function() {
    rimraf.sync(baseTestDir)
})