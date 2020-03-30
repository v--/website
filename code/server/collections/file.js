import path from 'path'

import { stat, readFile, readdir } from '../support/fs.js'
import { NotFoundError } from '../../common/errors.js'

export class FileCollection {
  async readDirectory (basePath) {
    const fullPath = path.join(this.store.config.fileRootPath, basePath)

    const result = {
      entries: [],
      readme: null
    }

    let files

    try {
      files = await readdir(fullPath, 'utf8')
    } catch (err) {
      if (err.code === 'ENOENT' || err.code === 'ENOTDIR') {
        throw new NotFoundError()
      } else {
        throw err
      }
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

  constructor (store) {
    this.store = store
  }
}
