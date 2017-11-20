import source from 'vinyl-source-stream'

import { readFile } from '../code/server/support/fs'

async function readPathFromIconFile(fileName) {
    const svg = await readFile(fileName, 'utf8')
    return svg.match(/<path d="(.*)" \/>/)[1]
}

export function getMDIcons({ iconsFile, outputFile }) {
    const stream = source(outputFile)

    readFile(iconsFile, 'utf8').then(function (icons) {
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

        stream.write('export default ' + JSON.stringify(result) + ' // eslint-disable-line')
        stream.end()
    })

    return stream
}
