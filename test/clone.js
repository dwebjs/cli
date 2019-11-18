var fs = require('fs')
var path = require('path')
var test = require('tape')
var tempDir = require('temporary-directory')
var spawn = require('./helpers/spawn.js')
var help = require('./helpers')

var dweb = path.resolve(path.join(__dirname, '..', 'bin', 'cli.js'))

test('clone - default opts', function(t) {
    help.shareFixtures(function(_, shareDWeb) {
        var key = shareDWeb.key.toString('hex')
        tempDir(function(_, dir, cleanup) {
            var cmd = dweb + ' clone ' + key
            var st = spawn(t, cmd, { cwd: dir })
            var dwebDir = path.join(dir, key)

            st.stdout.match(function(output) {
                var downloadFinished = output.indexOf('Exiting') > -1
                if (!downloadFinished) return false

                var stats = shareDWeb.stats.get()
                var fileRe = new RegExp(stats.files + ' files')
                var bytesRe = new RegExp(/1\.\d KB/)

                t.ok(output.match(fileRe), 'total size: files okay')
                t.ok(output.match(bytesRe), 'total size: bytes okay')
                t.ok(help.isDir(dwebDir), 'creates download directory')

                var fileList = help.fileList(dwebDir).join(' ')
                var hasCsvFile = fileList.indexOf('all_hour.csv') > -1
                t.ok(hasCsvFile, 'csv file downloaded')
                var hasDWebFolder = fileList.indexOf('.dweb') > -1
                t.ok(hasDWebFolder, '.dweb folder created')
                var hasSubDir = fileList.indexOf('folder') > -1
                t.ok(hasSubDir, 'folder created')
                var hasNestedDir = fileList.indexOf('nested') > -1
                t.ok(hasNestedDir, 'nested folder created')
                var hasHelloFile = fileList.indexOf('hello.txt') > -1
                t.ok(hasHelloFile, 'hello.txt file downloaded')

                st.kill()
                return true
            })
            st.succeeds('exits after finishing download')
            st.stderr.empty()
            st.end(function() {
                cleanup()
                shareDWeb.close()
            })
        })
    })
})

// Right now we aren't forcing this
// test('clone - errors on existing dir', function (t) {
//   tempDir(function (_, dir, cleanup) {
//     // make empty dWeb vault in directory
//     DWeb(dir, function (err, shareDWeb) {
//       t.error(err, 'no error')
//       // Try to clone to same dir
//       shareDWeb.close(function () {
//         var cmd = dweb + ' clone ' + shareDWeb.key.toString('hex') + ' ' + dir
//         var st = spawn(t, cmd)
//         st.stdout.empty()
//         st.stderr.match(function (output) {
//           t.same(output.trim(), 'Existing vault in this directory. Use pull or sync to update.', 'Existing vault.')
//           st.kill()
//           return true
//         })
//         st.end(cleanup)
//       })
//     })
//   })
// })

test('clone - specify dir', function(t) {
    help.shareFixtures(function(_, shareDWeb) {
        tempDir(function(_, dir, cleanup) {
            var key = shareDWeb.key.toString('hex')
            var customDir = 'my_dir'
            var cmd = dweb + ' clone ' + key + ' ' + customDir
            var st = spawn(t, cmd, { cwd: dir })
            st.stdout.match(function(output) {
                var downloadFinished = output.indexOf('Exiting') > -1
                if (!downloadFinished) return false

                t.ok(help.isDir(path.join(dir, customDir)), 'creates download directory')
                st.kill()
                return true
            })
            st.succeeds('exits after finishing download')
            st.stderr.empty()
            st.end(function() {
                cleanup()
                shareDWeb.close()
            })
        })
    })
})

test('clone - dweb:// link', function(t) {
    help.shareFixtures(function(_, shareDWeb) {
        tempDir(function(_, dir, cleanup) {
            var key = 'dweb://' + shareDWeb.key.toString('hex') + '/'
            var cmd = dweb + ' clone ' + key + ' '
            var downloadDir = path.join(dir, shareDWeb.key.toString('hex'))
            var st = spawn(t, cmd, { cwd: dir })
            st.stdout.match(function(output) {
                var downloadFinished = output.indexOf('Exiting') > -1
                if (!downloadFinished) return false

                t.ok(help.isDir(path.join(downloadDir)), 'creates download directory')
                st.kill()
                return true
            })
            st.succeeds('exits after finishing download')
            st.stderr.empty()
            st.end(function() {
                cleanup()
                shareDWeb.close()
            })
        })
    })
})

test('clone - dwebs.io/key link', function(t) {
    help.shareFixtures(function(_, shareDWeb) {
        tempDir(function(_, dir, cleanup) {
            var key = 'dwebs.io/' + shareDWeb.key.toString('hex') + '/'
            var cmd = dweb + ' clone ' + key + ' '
            var downloadDir = path.join(dir, shareDWeb.key.toString('hex'))
            var st = spawn(t, cmd, { cwd: dir })
            st.stdout.match(function(output) {
                var downloadFinished = output.indexOf('Exiting') > -1
                if (!downloadFinished) return false

                t.ok(help.isDir(path.join(downloadDir)), 'creates download directory')
                st.kill()
                return true
            })
            st.succeeds('exits after finishing download')
            st.stderr.empty()
            st.end(function() {
                cleanup()
                shareDWeb.close()
            })
        })
    })
})

// TODO: fix --temp for clones
// test('clone - with --temp', function (t) {
//   // cmd: dweb clone <link>
//   help.shareFixtures(function (_, fixturesDWeb) {
//     shareDWeb = fixturesDWeb
//     var key = shareDWeb.key.toString('hex')
//     var cmd = dweb + ' clone ' + key + ' --temp'
//     var st = spawn(t, cmd, {cwd: baseTestDir})
//     var dwebDir = path.join(baseTestDir, key)
//     st.stdout.match(function (output) {
//       var downloadFinished = output.indexOf('Download Finished') > -1
//       if (!downloadFinished) return false

//       var stats = shareDWeb.stats.get()
//       var fileRe = new RegExp(stats.filesTotal + ' files')
//       var bytesRe = new RegExp(/1\.\d{1,2} kB/)

//       t.ok(help.matchLink(output), 'prints link')
//       t.ok(output.indexOf('dweb-download-folder/' + key) > -1, 'prints dir')
//       t.ok(output.match(fileRe), 'total size: files okay')
//       t.ok(output.match(bytesRe), 'total size: bytes okay')
//       t.ok(help.isDir(dwebDir), 'creates download directory')

//       var fileList = help.fileList(dwebDir).join(' ')
//       var hasCsvFile = fileList.indexOf('all_hour.csv') > -1
//       t.ok(hasCsvFile, 'csv file downloaded')
//       var hasDWebFolder = fileList.indexOf('.dweb') > -1
//       t.ok(!hasDWebFolder, '.dweb folder not created')
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

test('clone - invalid link', function(t) {
    var key = 'best-key-ever'
    var cmd = dweb + ' clone ' + key
    tempDir(function(_, dir, cleanup) {
        var st = spawn(t, cmd, { cwd: dir })
        var dwebDir = path.join(dir, key)
        st.stderr.match(function(output) {
            var error = output.indexOf('Could not resolve link') > -1
            if (!error) return false
            t.ok(error, 'has error')
            t.ok(!help.isDir(dwebDir), 'download dir removed')
            st.kill()
            return true
        })
        st.end(cleanup)
    })
})

test('clone - shortcut/stateless clone', function(t) {
    help.shareFixtures(function(_, shareDWeb) {
        var key = shareDWeb.key.toString('hex')
        tempDir(function(_, dir, cleanup) {
            var dwebDir = path.join(dir, key)
            var cmd = dweb + ' ' + key + ' ' + dwebDir + ' --exit'
            var st = spawn(t, cmd)

            st.stdout.match(function(output) {
                var downloadFinished = output.indexOf('Exiting') > -1
                if (!downloadFinished) return false

                t.ok(help.isDir(dwebDir), 'creates download directory')

                var fileList = help.fileList(dwebDir).join(' ')
                var hasCsvFile = fileList.indexOf('all_hour.csv') > -1
                t.ok(hasCsvFile, 'csv file downloaded')
                var hasDWebFolder = fileList.indexOf('.dweb') > -1
                t.ok(hasDWebFolder, '.dweb folder created')
                var hasSubDir = fileList.indexOf('folder') > -1
                t.ok(hasSubDir, 'folder created')
                var hasNestedDir = fileList.indexOf('nested') > -1
                t.ok(hasNestedDir, 'nested folder created')
                var hasHelloFile = fileList.indexOf('hello.txt') > -1
                t.ok(hasHelloFile, 'hello.txt file downloaded')

                st.kill()
                return true
            })
            st.succeeds('exits after finishing download')
            st.stderr.empty()
            st.end(function() {
                cleanup()
                shareDWeb.close()
            })
        })
    })
})

// TODO: fix this
// test('clone - ddatabase link', function (t) {
//   help.shareFeed(function (_, key, close) {
//     tempDir(function (_, dir, cleanup) {
//       var cmd = dweb + ' clone ' + key
//       var st = spawn(t, cmd, {cwd: dir})
//       var dwebDir = path.join(dir, key)
//       st.stderr.match(function (output) {
//         var error = output.indexOf('not a dWeb Vault') > -1
//         if (!error) return false
//         t.ok(error, 'has error')
//         t.ok(!help.isDir(dwebDir), 'download dir removed')
//         st.kill()
//         return true
//       })
//       st.end(function () {
//         cleanup()
//         close()
//       })
//     })
//   })
// })

test('clone - specify directory containing dweb.json', function(t) {
    help.shareFixtures(function(_, shareDWeb) {
        tempDir(function(_, dir, cleanup) {
            fs.writeFileSync(path.join(dir, 'dweb.json'), JSON.stringify({ url: shareDWeb.key.toString('hex') }), 'utf8')

            // dweb clone /dir
            var cmd = dweb + ' clone ' + dir
            var st = spawn(t, cmd)
            var dwebDir = dir

            st.stdout.match(function(output) {
                var downloadFinished = output.indexOf('Exiting') > -1
                if (!downloadFinished) return false

                var fileList = help.fileList(dwebDir).join(' ')
                var hasCsvFile = fileList.indexOf('all_hour.csv') > -1
                t.ok(hasCsvFile, 'csv file downloaded')
                var hasDWebFolder = fileList.indexOf('.dweb') > -1
                t.ok(hasDWebFolder, '.dweb folder created')
                var hasSubDir = fileList.indexOf('folder') > -1
                t.ok(hasSubDir, 'folder created')
                var hasNestedDir = fileList.indexOf('nested') > -1
                t.ok(hasNestedDir, 'nested folder created')
                var hasHelloFile = fileList.indexOf('hello.txt') > -1
                t.ok(hasHelloFile, 'hello.txt file downloaded')

                st.kill()
                return true
            })
            st.succeeds('exits after finishing download')
            st.stderr.empty()
            st.end(function() {
                cleanup()
                shareDWeb.close()
            })
        })
    })
})

test('clone - specify directory containing dweb.json with cwd', function(t) {
    help.shareFixtures(function(_, shareDWeb) {
        tempDir(function(_, dir, cleanup) {
            fs.writeFileSync(path.join(dir, 'dweb.json'), JSON.stringify({ url: shareDWeb.key.toString('hex') }), 'utf8')

            // cd dir && dweb clone /dir/dweb.json
            var cmd = dweb + ' clone ' + dir
            var st = spawn(t, cmd, { cwd: dir })
            var dwebDir = dir

            st.stdout.match(function(output) {
                var downloadFinished = output.indexOf('Exiting') > -1
                if (!downloadFinished) return false

                var fileList = help.fileList(dwebDir).join(' ')
                var hasCsvFile = fileList.indexOf('all_hour.csv') > -1
                t.ok(hasCsvFile, 'csv file downloaded')
                var hasDWebFolder = fileList.indexOf('.dweb') > -1
                t.ok(hasDWebFolder, '.dweb folder created')
                var hasSubDir = fileList.indexOf('folder') > -1
                t.ok(hasSubDir, 'folder created')
                var hasNestedDir = fileList.indexOf('nested') > -1
                t.ok(hasNestedDir, 'nested folder created')
                var hasHelloFile = fileList.indexOf('hello.txt') > -1
                t.ok(hasHelloFile, 'hello.txt file downloaded')

                st.kill()
                return true
            })
            st.succeeds('exits after finishing download')
            st.stderr.empty()
            st.end(function() {
                cleanup()
                shareDWeb.close()
            })
        })
    })
})

test('clone - specify dweb.json path', function(t) {
    help.shareFixtures(function(_, shareDWeb) {
        tempDir(function(_, dir, cleanup) {
            var dwebJsonPath = path.join(dir, 'dweb.json')
            fs.writeFileSync(dwebJsonPath, JSON.stringify({ url: shareDWeb.key.toString('hex') }), 'utf8')

            // dweb clone /dir/dweb.json
            var cmd = dweb + ' clone ' + dwebJsonPath
            var st = spawn(t, cmd)
            var dwebDir = dir

            st.stdout.match(function(output) {
                var downloadFinished = output.indexOf('Exiting') > -1
                if (!downloadFinished) return false

                var fileList = help.fileList(dwebDir).join(' ')
                var hasCsvFile = fileList.indexOf('all_hour.csv') > -1
                t.ok(hasCsvFile, 'csv file downloaded')
                var hasDWebFolder = fileList.indexOf('.dweb') > -1
                t.ok(hasDWebFolder, '.dweb folder created')
                var hasSubDir = fileList.indexOf('folder') > -1
                t.ok(hasSubDir, 'folder created')
                var hasNestedDir = fileList.indexOf('nested') > -1
                t.ok(hasNestedDir, 'nested folder created')
                var hasHelloFile = fileList.indexOf('hello.txt') > -1
                t.ok(hasHelloFile, 'hello.txt file downloaded')

                st.kill()
                return true
            })
            st.succeeds('exits after finishing download')
            st.stderr.empty()
            st.end(function() {
                cleanup()
                shareDWeb.close()
            })
        })
    })
})

test('clone - specify dweb.json path with cwd', function(t) {
    help.shareFixtures(function(_, shareDWeb) {
        tempDir(function(_, dir, cleanup) {
            var dwebJsonPath = path.join(dir, 'dweb.json')
            fs.writeFileSync(dwebJsonPath, JSON.stringify({ url: shareDWeb.key.toString('hex') }), 'utf8')

            // cd /dir && dweb clone /dir/dweb.json
            var cmd = dweb + ' clone ' + dwebJsonPath
            var st = spawn(t, cmd, { cwd: dir })
            var dwebDir = dir

            st.stdout.match(function(output) {
                var downloadFinished = output.indexOf('Exiting') > -1
                if (!downloadFinished) return false

                var fileList = help.fileList(dwebDir).join(' ')
                var hasCsvFile = fileList.indexOf('all_hour.csv') > -1
                t.ok(hasCsvFile, 'csv file downloaded')
                var hasDWebFolder = fileList.indexOf('.dweb') > -1
                t.ok(hasDWebFolder, '.dweb folder created')
                var hasSubDir = fileList.indexOf('folder') > -1
                t.ok(hasSubDir, 'folder created')
                var hasNestedDir = fileList.indexOf('nested') > -1
                t.ok(hasNestedDir, 'nested folder created')
                var hasHelloFile = fileList.indexOf('hello.txt') > -1
                t.ok(hasHelloFile, 'hello.txt file downloaded')

                st.kill()
                return true
            })
            st.succeeds('exits after finishing download')
            st.stderr.empty()
            st.end(function() {
                cleanup()
                shareDWeb.close()
            })
        })
    })
})

test('clone - specify dweb.json + directory', function(t) {
    help.shareFixtures(function(_, shareDWeb) {
        tempDir(function(_, dir, cleanup) {
            var dwebDir = path.join(dir, 'clone-dest')
            var dwebJsonPath = path.join(dir, 'dweb.json') // make dweb.json in different dir

            fs.mkdirSync(dwebDir)
            fs.writeFileSync(dwebJsonPath, JSON.stringify({ url: shareDWeb.key.toString('hex') }), 'utf8')

            // dweb clone /dir/dweb.json /dir/clone-dest
            var cmd = dweb + ' clone ' + dwebJsonPath + ' ' + dwebDir
            var st = spawn(t, cmd)

            st.stdout.match(function(output) {
                var downloadFinished = output.indexOf('Exiting') > -1
                if (!downloadFinished) return false

                var fileList = help.fileList(dwebDir).join(' ')
                var hasCsvFile = fileList.indexOf('all_hour.csv') > -1
                t.ok(hasCsvFile, 'csv file downloaded')
                var hasDWebFolder = fileList.indexOf('.dweb') > -1
                t.ok(hasDWebFolder, '.dweb folder created')
                var hasSubDir = fileList.indexOf('folder') > -1
                t.ok(hasSubDir, 'folder created')
                var hasNestedDir = fileList.indexOf('nested') > -1
                t.ok(hasNestedDir, 'nested folder created')
                var hasHelloFile = fileList.indexOf('hello.txt') > -1
                t.ok(hasHelloFile, 'hello.txt file downloaded')

                st.kill()
                return true
            })
            st.succeeds('exits after finishing download')
            st.stderr.empty()
            st.end(function() {
                cleanup()
                shareDWeb.close()
            })
        })
    })
})