import source from 'vinyl-source-stream'

import fs from 'fs/promises'

async function readPathFromIconFile(fileName: string) {
  const svg = await fs.readFile(fileName, 'utf8')
  const match = svg.match(/<path d="(.*)" \/>/)

  if (match !== null) {
    return match[1]
  }
}

export function getMDIcons({ iconsFile, outputFile }: { iconsFile: string, outputFile: string }): NodeJS.ReadWriteStream {
  const stream = source(outputFile)

  fs.readFile(iconsFile, 'utf8').then(function(icons) {
    const promises = JSON.parse(icons)
      .map(async function(name: string) {
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
