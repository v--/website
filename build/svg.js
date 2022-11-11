import { join as joinPath, dirname, extname, relative } from 'path'
import { readFile, writeFile, mkdir, opendir } from 'node:fs/promises'

import svgo from 'svgo'

import { Logger } from '../code/server/support/logger.js'

const logger = new Logger('svgo')

const SRC_PATH = 'client/svgs'
const DEST_PATH = 'public/images'

/**
 * @param {string} src
 */
export async function buildSVG(src) {
  const string = await readFile(src, { encoding: 'utf8' })
  const optimized = svgo.optimize(string, { path: src })
  const dest = joinPath(DEST_PATH, relative(SRC_PATH, src))
  await mkdir(dirname(dest), { recursive: true })
  await writeFile(dest, optimized.data)
  logger.info(`${src} -> ${dest}`)
}

/**
 * @param {string} path
 */
export async function buildAllSVG(path = SRC_PATH) {
  for await (const entry of await opendir(path)) {
    const fullPath = joinPath(path, entry.name)

    if (entry.isDirectory()) {
      await buildAllSVG(fullPath)
    } else if (entry.isFile() && extname(fullPath) === '.svg') {
      await buildSVG(fullPath)
    }
  }
}
