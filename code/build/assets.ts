import { join as joinPath, dirname, relative } from 'path'
import fs from 'fs/promises'

import { Logger } from '../server/support/logger.js'

const logger = new Logger('svgo')

const SRC_PATH = 'client/assets'
const DEST_PATH = 'public'

export async function copyAsset(src: string) {
  const dest = joinPath(DEST_PATH, relative(SRC_PATH, src))
  await fs.mkdir(dirname(dest), { recursive: true })
  await fs.copyFile(src, dest)
  logger.info(`${src} -> ${dest}`)
}

export async function buildAssets(path: string = SRC_PATH) {
  for await (const entry of await fs.opendir(path)) {
    const fullPath = joinPath(path, entry.name)

    if (entry.isDirectory()) {
      await buildAssets(fullPath)
    } else if (entry.isFile()) {
      await copyAsset(fullPath)
    }
  }
}
