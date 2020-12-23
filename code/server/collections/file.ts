import { stat, readFile, readdir } from 'fs/promises'
import path from 'path'

import { ForbiddenError, NotFoundError } from '../../common/errors.js'
import { IFileCollection } from '../../common/types/store.js'
import { IDirectory } from '../../common/types/files.js'

export class FileCollection implements IFileCollection {
  constructor(
    public fileRootPath: string
  ) {}

  updateFileRootPath(path: string) {
    this.fileRootPath = path
  }

  async readDirectory(basePath: string) {
    if (/\/?Unlisted\/*$/.test(basePath)) {
      throw new ForbiddenError()
    }

    const fullPath = path.join(this.fileRootPath, basePath)

    const result: IDirectory = {
      entries: []
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

      if (name[0] === '.' || name === 'Unlisted') {
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
