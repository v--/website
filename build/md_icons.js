const source = require('vinyl-source-stream')

const { readFile } = require('mz/fs')

async function readPathFromIconFile(fileName) {
    const svg = await readFile(fileName, 'utf8')
    return svg.match(/<path d="(.*)" \/>/)[1]
}

function getMDIcons({ icons, fileName }) {
    const promises = icons
      .map(async function (name) {
          return {
              [name]: await readPathFromIconFile(`node_modules/mdi-svg/svg/${name}.svg`)
          }
      })

    const stream = source(fileName)

    Promise.all(promises).then(function (iconObjects) {
        const result = iconObjects
          .reduce((accum, icon) => Object.assign(accum, icon), {})

        stream.write('module.exports = ' + JSON.stringify(result) + ' // eslint-disable-line')
        stream.end()
    })

    return stream
}

module.exports = { getMDIcons }
