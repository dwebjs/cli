var path = require('path')
var test = require('tape')
var tempDir = require('temporary-directory')
var spawn = require('./helpers/spawn.js')
var help = require('./helpers')

var dweb = path.resolve(path.join(__dirname, '..', 'bin', 'cli.js'))

test('pull - errors without clone first', function(t) {
    tempDir(function(_, dir, cleanup) {
        var cmd = dweb + ' pull'
        var st = spawn(t, cmd, { cwd: dir })
        st.stderr.match(function(output) {
            t.ok('No existing vault', 'Error: no existing vault')
            st.kill()
            return true
        })
        st.end(cleanup)
    })
})

test('pull - default opts', function(t) {
    // import false so we can pull files later
    help.shareFixtures({ import: false }, function(_, fixturesDWeb) {
        tempDir(function(_, dir, cleanup) {
            // clone initial dweb vault
            var cmd = dweb + ' clone ' + fixturesDWeb.key.toString('hex') + ' ' + dir
            var st = spawn(t, cmd, { end: false })
            st.stdout.match(function(output) {
                var synced = output.indexOf('dweb synced') > -1
                if (!synced) return false
                st.kill()
                fixturesDWeb.close(doPull)
                return true
            })

            function doPull() {
                // TODO: Finish this one. Need some bug fixes on empty pulls =(
                help.shareFixtures({ resume: true, import: true }, function(_, fixturesDWeb) {
                    var cmd = dweb + ' pull'
                    var st = spawn(t, cmd, { cwd: dir })
                    st.stdout.match(function(output) {
                        var downloadFinished = output.indexOf('dweb sync') > -1
                        if (!downloadFinished) return false
                        st.kill()
                        return true
                    })
                    st.succeeds('exits after finishing download')
                    st.stderr.empty()
                    st.end(function() {
                        fixturesDWeb.close()
                    })
                })
            }
        })
    })
})

// test('pull - default opts', function (t) {
//   // cmd: dweb pull
//   // import the files to the sharer so we can pull new data
//   shareDWeb.importFiles(function (err) {
//     if (err) throw err

//     var dwebDir = path.join(baseTestDir, shareKey)
//     var cmd = dweb + ' pull'
//     var st = spawn(t, cmd, {cwd: dwebDir})
//     st.stdout.match(function (output) {
//       var downloadFinished = output.indexOf('Download Finished') > -1
//       if (!downloadFinished) return false

//       var stats = shareDWeb.stats.get()
//       var fileRe = new RegExp(stats.filesTotal + ' files')
//       var bytesRe = new RegExp(/1\.\d{1,2} kB/)

//       t.ok(help.matchLink(output), 'prints link')
//       t.ok(output.indexOf('dweb-download-folder/' + shareKey) > -1, 'prints dir')
//       t.ok(output.match(fileRe), 'total size: files okay')
//       t.ok(output.match(bytesRe), 'total size: bytes okay')
//       t.ok(help.isDir(dwebDir), 'creates download directory')

//       var fileList = help.fileList(dwebDir).join(' ')
//       var hasCsvFile = fileList.indexOf('all_hour.csv') > -1
//       t.ok(hasCsvFile, 'csv file downloaded')
//       var hasDWebFolder = fileList.indexOf('.dweb') > -1
//       t.ok(hasDWebFolder, '.dweb folder created')
//       var hasSubDir = fileList.indexOf('folder') > -1
//       t.ok(hasSubDir, 'folder created')
//       var hasNestedDir = fileList.indexOf('nested') > -1
//       t.ok(hasNestedDir, 'nested folder created')
//       var hasHelloFile = fileList.indexOf('hello.txt') > -1
//       t.ok(hasHelloFile, 'hello.txt file downloaded')

//       st.kill()
//       return true
//     })
//     st.succeeds('exits after finishing download')
//     st.stderr.empty()
//     st.end()
//   })
// })

// test('pull - with dir arg', function (t) {
//   var dirName = shareKey
//   var dwebDir = path.join(baseTestDir, shareKey)
//   var cmd = dweb + ' pull ' + dirName
//   var st = spawn(t, cmd, {cwd: baseTestDir})
//   st.stdout.match(function (output) {
//     var downloadFinished = output.indexOf('Download Finished') > -1
//     if (!downloadFinished) return false

//     t.ok(output.indexOf('dweb-download-folder/' + dirName) > -1, 'prints dir')
//     t.ok(help.isDir(dwebDir), 'creates download directory')

//     st.kill()
//     return true
//   })
//   st.succeeds('exits after finishing download')
//   st.stderr.empty()
//   st.end()
// })