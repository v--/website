import path from 'path'

import { stat, readFile, readdir } from '../support/fs.mjs'
import { startsWith } from '../../common/support/strings.mjs'
import { NotFoundError } from '../../common/errors.mjs'

export default class FileCollection {
  async readDirectory (basePath) {
    const fullPath = path.join(this.db.config.fileRootPath, basePath)

    const result = {
      entries: [],
      readme: null
    }

    let files

    try {
      files = await readdir(fullPath, 'utf8')
    } catch (e) {
      if (e.code === 'ENOENT' || e.code === 'ENOTDIR') {
        throw new NotFoundError(fullPath)
      } else {
        throw e
      }
    }

    const parentStat = await stat(fullPath)

    if (basePath !== '') {
      result.entries.push({
        name: '..',
        isFile: false,
        modified: String(parentStat.mtime),
        size: parentStat.size
      })
    }

    for (const name of files) {
      const childStat = await stat(path.join(fullPath, name))

      if (name === '.readme.md') {
        result.readme = await readFile(path.join(fullPath, name), 'utf8')
      }

      if (name[0] === '.') {
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

  constructor (db) {
    this.db = db
  }
}
