import { stat, readFile, readdir } from 'fs/promises'
import path from 'path'

import { ForbiddenError, NotFoundError } from '../../common/errors.js'

/**
 * @implements TStore.IFileCollection
 */
export class FileCollection {
  /**
   * @param {string} fileRootPath
   */
  constructor(fileRootPath) {
    this.fileRootPath = fileRootPath
  }

  /**
   * @param {string} path
   */
  updateFileRootPath(path) {
    this.fileRootPath = path
  }

  /**
   * @param {string} basePath
   */
  async readDirectory(basePath) {
    if (basePath.split('/').some(segment => segment.startsWith('.'))) {
      throw new ForbiddenError()
    }

    const fullPath = path.join(this.fileRootPath, basePath)

    /** @type {TFiles.IDirectory} */
    const result = {
      entries: []
    }

    let files

    try {
      files = await readdir(fullPath, 'utf8')
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (err instanceof Error && err.code === 'ENOENT' || err.code === 'ENOTDIR') {
        throw new NotFoundError()
      } else {
        throw err
      }
    }

    for (const name of files) {
      const childStat = await stat(path.join(fullPath, name))

      if (name === '.README.md') {
        result.readme = await readFile(path.join(fullPath, name), 'utf8')
      }

      if (name.startsWith('.')) {
        continue
      }

      result.entries.push({
        name,
        isFile: childStat.isFile(),
        modified: String(childStat.mtime),
        size: childStat.size
      })
    }

    return result
  }
}
