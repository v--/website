import source from 'vinyl-source-stream'

import fs from 'fs/promises'

/**
 * @param {string} fileName
 */
async function readPathFromIconFile(fileName) {
  const svg = await fs.readFile(fileName, 'utf8')
  const match = svg.match(/<path d="(.*)" \/>/)

  if (match !== null) {
    return match[1]
  }
}

/**
 * @param {{ iconsFile: string, outputFile: string }} param1
 * @returns {NodeJS.ReadWriteStream}
 */
export function getMDIcons({ iconsFile, outputFile }) {
  const stream = source(outputFile)

  fs.readFile(iconsFile, 'utf8').then(function(icons) {
    const promises = JSON.parse(icons)
      .map(/** @param {string} name */ async function(name) {
        return {
          [name]: await readPathFromIconFile(`node_modules/@mdi/svg/svg/${name}.svg`)
        }
      })

    return Promise.all(promises)
  }).then(function(iconObjects) {
    const result = iconObjects
      .reduce((accum, icon) => Object.assign(accum, icon), {})

    stream.write(JSON.stringify(result))
    stream.end()
  })

  return stream
}
