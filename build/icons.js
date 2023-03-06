import { mkdir, readFile, writeFile } from 'node:fs/promises'

import { Logger } from '../code/server/support/logger.js'

const logger = new Logger('icons')

const SRC_PATH = 'client/iconref.json'
const DEST_PATH = 'public/icons.json'

/**
 * @param {string} fileName
 */
async function readPathFromIconFile(fileName) {
  const svg = await readFile(fileName, 'utf8')
  const match = svg.match(/<svg xmlns="http:\/\/www.w3.org\/2000\/svg" viewBox="(.*)">.*<path d="(.*)"\/><\/svg>/)

  if (match !== null) {
    return {
      viewBox: match[1],
      path: match[2]
    }
  }
}

export async function buildIcons() {
  /** @type {string[]} */
  const iconRef = JSON.parse(await readFile(SRC_PATH, 'utf8'))
  const promises = iconRef
    .map(async function(name) {
      return {
        [name]: await readPathFromIconFile(`fontawesome/svgs/${name}.svg`)
      }
    })

  const iconObjects = await Promise.all(promises)
  const result = iconObjects
    .reduce((accum, icon) => Object.assign(accum, icon), {})

  await mkdir('public', { recursive: true })
  await writeFile(DEST_PATH, JSON.stringify(result))
  logger.info(`${SRC_PATH} -> ${DEST_PATH}`)
}
