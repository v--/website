import path from 'path'

import { stat, readdir } from '../support/fs.js'
import { NotFoundError } from '../../common/errors.js'

export class GalleryCollection {
  async readDirectory (basePath) {
    const { galleryPath, galleryThumbPath } = this.store.config
    let fileNames

    try {
      fileNames = await readdir(path.join(galleryPath, basePath), 'utf8')
    } catch (err) {
      if (err.code === 'ENOENT' || err.code === 'ENOTDIR') {
        throw new NotFoundError()
      } else {
        throw err
      }
    }

    const files = []

    for (const fileName of fileNames) {
      const filePath = path.join(galleryPath, basePath, fileName)
      const fileStat = await stat(filePath)
      const thumbPath = path.join(galleryThumbPath, basePath, fileName) + '.jpg'

      files.push({
        isFile: fileStat.isFile(),
        name: fileName,
        url: path.join(basePath, fileName),
        thumbnail: thumbPath
      })
    }

    return { files }
  }

  constructor (store) {
    this.store = store
  }
}
