import { join as joinPath, dirname, relative } from 'path'

import { mkdir, opendir } from 'node:fs/promises'

import { Logger } from '../code/server/support/logger.js'
import { copyFile } from 'fs/promises'

const logger = new Logger('svgo')

const SRC_PATH = 'client/assets'
const DEST_PATH = 'public'

/**
 * @param {string} src
 */
export async function copyAsset(src) {
  const dest = joinPath(DEST_PATH, relative(SRC_PATH, src))
  await mkdir(dirname(dest), { recursive: true })
  await copyFile(src, dest)
  logger.info(`${src} -> ${dest}`)
}

/**
 * @param {string} path
 */
export async function buildAssets(path = SRC_PATH) {
  for await (const entry of await opendir(path)) {
    const fullPath = joinPath(path, entry.name)

    if (entry.isDirectory()) {
      await buildAssets(fullPath)
    } else if (entry.isFile()) {
      await copyAsset(fullPath)
    }
  }
}
