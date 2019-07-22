const readline = require('readline')

async function loadTests (fileNames) {
  for (const fileName of fileNames) {
    await import('.' + fileName.substring('tests'.length))
  }
}

async function readFileNames (stdin) {
  const iface = readline.createInterface({
    input: stdin,
    terminal: false
  })

  return new Promise(function (resolve, reject) {
    const fileNames = []

    iface.on('line', function (line) {
      Array.prototype.push.apply(fileNames, line.split(' '))
    })

    iface.on('close', function () {
      resolve(fileNames)
    })
  })
}

readFileNames(process.stdin).then(loadTests).then(run)
