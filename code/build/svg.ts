import { join as joinPath, dirname, extname, relative } from 'path'
import fs from 'fs/promises'

import svgo from 'svgo'

import { Logger } from '../server/support/logger.js'

const logger = new Logger('svgo')

const SRC_PATH = 'client/svgs'
const DEST_PATH = 'public/images'

export async function buildSVG(src: string) {
  const string = await fs.readFile(src, { encoding: 'utf8' })
  const optimized = svgo.optimize(string, { path: src })
  const dest = joinPath(DEST_PATH, relative(SRC_PATH, src))
  await fs.mkdir(dirname(dest), { recursive: true })
  await fs.writeFile(dest, optimized.data)
  logger.info(`${src} -> ${dest}`)
}

/**
 * @param {string} path
 */
export async function buildAllSVG(path = SRC_PATH) {
  for await (const entry of await fs.opendir(path)) {
    const fullPath = joinPath(path, entry.name)

    if (entry.isDirectory()) {
      await buildAllSVG(fullPath)
    } else if (entry.isFile() && extname(fullPath) === '.svg') {
      await buildSVG(fullPath)
    }
  }
}
