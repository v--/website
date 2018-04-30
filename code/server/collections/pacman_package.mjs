import tar from 'tar-stream'
import lzma from 'lzma-native'

import { createReadStream } from '../support/fs'

function parsePacmanInfoStream (stream) {
  return new Promise(function (resolve, reject) {
    let buffer = []
    let key = ''
    let inTitle = false
    const result = {}

    stream
      .setEncoding('utf8')
      .on('data', function (data) {
        for (const char of data) {
          switch (char) {
            case '%':
              inTitle = !inTitle

              if (!inTitle) {
                key = buffer.join('')
                buffer = []
              }

              break

            case '\n':
              if (buffer.length > 0) {
                result[key] = buffer.join('')
                buffer = []
              }

              break

            default:
              buffer.push(char)
          }
        }
      })
      .on('error', reject)
      .on('end', function () {
        resolve(result)
      })
  })
}

function parsePacmanDatabase (path) {
  const stream = createReadStream(path)
    .pipe(lzma.createDecompressor())
    .pipe(tar.extract())

  return new Promise(function (resolve, reject) {
    const packages = []

    stream
      .on('error', reject)
      .on('entry', async function (header, entryStream, next) {
        if (header.type === 'file') {
          const meta = await parsePacmanInfoStream(entryStream)
          packages.push({
            name: meta.NAME,
            version: meta.VERSION,
            description: meta.DESC,
            arch: meta.ARCH
          })
        }

        next()
      })
      .on('finish', function () {
        resolve(packages)
      })
  })
}

export default class PacmanPackageCollection {
  async cachePackages (dbPath) {
    this.cachedPackages = await parsePacmanDatabase(dbPath)
  }

  async load () {
    return this.cachedPackages || parsePacmanDatabase(this.db.config.pacmanDBPath)
  }

  constructor (db) {
    this.db = db
  }
}
