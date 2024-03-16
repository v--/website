import { join as joinPath, dirname, relative, basename } from 'path'
import fs from 'fs/promises'

import * as sass from 'sass'

import { Logger } from '../server/support/logger.js'

const logger = new Logger('sass')

const SRC_PATH = 'client/styles'
const DEST_PATH = 'public/styles'

export function getIndexSCSS(path: string) {
  const dir = relative(SRC_PATH, path).split('/', 2)[0]
  return joinPath(SRC_PATH, dir, 'index.scss')
}

export async function buildSASS(src: string) {
  let result: sass.CompileResult

  try {
    result = sass.compile(src, { style: 'compressed' })
  } catch (err) {
    if (err instanceof sass.Exception) {
      logger.warn(String(err))
      return
    } else {
      throw err
    }
  }

  const dest = joinPath(DEST_PATH, relative(SRC_PATH, dirname(src)), basename(src, '.scss') + '.css')
  await fs.mkdir(dirname(dest), { recursive: true })
  await fs.writeFile(dest, result.css)
  logger.info(`${src} -> ${dest}`)
}

export async function buildAllSASS(path: string = SRC_PATH) {
  for await (const entry of await fs.opendir(path)) {
    const fullPath = joinPath(path, entry.name)

    if (entry.isDirectory()) {
      await buildAllSASS(fullPath)
    } else if (entry.isFile() && entry.name == 'index.scss') {
      await buildSASS(fullPath)
    }
  }
}
