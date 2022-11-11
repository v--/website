import { join as joinPath, dirname, relative, basename } from 'path'
import { writeFile, mkdir, opendir } from 'node:fs/promises'

import sass from 'sass'

import { Logger } from '../code/server/support/logger.js'

const logger = new Logger('sass')

const SRC_PATH = 'client/styles'
const DEST_PATH = 'public/styles'

/**
 * @param {string} path
 */
export function getIndexSCSS(path) {
  const dir = relative(SRC_PATH, path).split('/', 2)[0]
  return joinPath(SRC_PATH, dir, 'index.scss')
}

/**
 * @param {string} src
 */
export async function buildSASS(src) {
  const result = sass.compile(src, { style: 'compressed' })
  const dest = joinPath(DEST_PATH, relative(SRC_PATH, basename(src, '.scss'))) + '.css'
  await mkdir(dirname(dest), { recursive: true })
  await writeFile(dest, result.css)
  logger.info(`${src} -> ${dest}`)
}

/**
 * @param {string} path
 */
export async function buildAllSASS(path = SRC_PATH) {
  for await (const entry of await opendir(path)) {
    const fullPath = joinPath(path, entry.name)

    if (entry.isDirectory()) {
      await buildAllSASS(fullPath)
    } else if (entry.isFile() && entry.name == 'index.scss') {
      await buildSASS(fullPath)
    }
  }
}
