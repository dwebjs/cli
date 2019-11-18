var fs = require('fs')
var path = require('path')
var test = require('tape')
var tempDir = require('temporary-directory')
var DWeb = require('@dwebjs/core')
var spawn = require('./helpers/spawn.js')
var help = require('./helpers')

var dweb = path.resolve(path.join(__dirname, '..', 'bin', 'cli.js'))
var fixtures = path.join(__dirname, 'fixtures')

// os x adds this if you view the fixtures in finder and breaks the file count assertions
try { fs.unlinkSync(path.join(fixtures, '.DS_Store')) } catch (e) { /* ignore error */ }

// start without dweb.json
try { fs.unlinkSync(path.join(fixtures, 'dweb.json')) } catch (e) { /* ignore error */ }

test('create - default opts no import', function(t) {
    tempDir(function(_, dir, cleanup) {
        var cmd = dweb + ' create --title data --description thing'
        var st = spawn(t, cmd, { cwd: dir })

        st.stdout.match(function(output) {
            var dwebCreated = output.indexOf('Created empty dWeb vault') > -1
            if (!dwebCreated) return false

            t.ok(help.isDir(path.join(dir, '.dweb')), 'creates dWeb vault directory')

            st.kill()
            return true
        })
        st.succeeds('exits after create finishes')
        st.stderr.empty()
        st.end(cleanup)
    })
})

test('create - errors on existing vault', function(t) {
    tempDir(function(_, dir, cleanup) {
        DWeb(dir, function(err, dweb) {
            t.error(err, 'no error')
            dweb.close(function() {
                var cmd = dweb + ' create --title data --description thing'
                var st = spawn(t, cmd, { cwd: dir })
                st.stderr.match(function(output) {
                    t.ok(output, 'errors')
                    st.kill()
                    return true
                })
                st.end()
            })
        })
    })
})

test('create - sync after create ok', function(t) {
    tempDir(function(_, dir, cleanup) {
        var cmd = dweb + ' create --title data --description thing'
        var st = spawn(t, cmd, { cwd: dir, end: false })
        st.stdout.match(function(output) {
            var connected = output.indexOf('Created empty dWeb vault') > -1
            if (!connected) return false
            doSync()
            return true
        })

        function doSync() {
            var cmd = dweb + ' sync '
            var st = spawn(t, cmd, { cwd: dir })

            st.stdout.match(function(output) {
                var connected = output.indexOf('Sharing') > -1
                if (!connected) return false
                st.kill()
                return true
            })
            st.stderr.empty()
            st.end(cleanup)
        }
    })
})

test('create - init alias', function(t) {
    tempDir(function(_, dir, cleanup) {
        var cmd = dweb + ' init --title data --description thing'
        var st = spawn(t, cmd, { cwd: dir })

        st.stdout.match(function(output) {
            var dwebCreated = output.indexOf('Created empty dWeb vault') > -1
            if (!dwebCreated) return false

            t.ok(help.isDir(path.join(dir, '.dweb')), 'creates dWeb vault directory')

            st.kill()
            return true
        })
        st.succeeds('exits after create finishes')
        st.stderr.empty()
        st.end(cleanup)
    })
})

test('create - with path', function(t) {
    tempDir(function(_, dir, cleanup) {
        var cmd = dweb + ' init ' + dir + ' --title data --description thing'
        var st = spawn(t, cmd)
        st.stdout.match(function(output) {
            var dwebCreated = output.indexOf('Created empty dWeb vault') > -1
            if (!dwebCreated) return false

            t.ok(help.isDir(path.join(dir, '.dweb')), 'creates dWeb vault directory')

            st.kill()
            return true
        })
        st.succeeds('exits after create finishes')
        st.stderr.empty()
        st.end(cleanup)
    })
})