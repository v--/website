const source = require('vinyl-source-stream')

const fs = require('fs')

function readUTF8File (fileName) {
  return new Promise(function (resolve, reject) {
    fs.readFile(fileName, 'utf8', function (err, data) {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

async function readPathFromIconFile (fileName) {
  const svg = await readUTF8File(fileName)
  return svg.match(/<path d="(.*)" \/>/)[1]
}

module.exports = {
  getMDIcons ({ iconsFile, outputFile }) {
    const stream = source(outputFile)

    readUTF8File(iconsFile).then(function (icons) {
      const promises = JSON.parse(icons)
        .map(async function (name) {
          return {
            [name]: await readPathFromIconFile(`node_modules/mdi-svg/svg/${name}.svg`)
          }
        })

      return Promise.all(promises)
    }).then(function (iconObjects) {
      const result = iconObjects
        .reduce((accum, icon) => Object.assign(accum, icon), {})

      stream.write(JSON.stringify(result))
      stream.end()
    })

    return stream
  }
}
