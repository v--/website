import { spawn } from 'child_process'

function parsePacmanInfoStream (stream) {
  return new Promise(function (resolve, reject) {
    let buffer = []
    let key = ''
    let inTitle = false
    let currentFile = {}
    const files = []

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
                const value = buffer.join('')
                buffer = []

                if (key === 'FILENAME') {
                  currentFile = {}
                  files.push(currentFile)
                }

                currentFile[key] = value
              }

              break

            default:
              buffer.push(char)
          }
        }
      })
      .on('error', reject)
      .on('end', function () {
        resolve(files)
      })
  })
}

function parsePacmanDatabase (path) {
  const proc = spawn('/usr/bin/tar', ['--extract', '--file', path, '--to-stdout'])
  return parsePacmanInfoStream(proc.stdout).then(function (packageMeta) {
    return packageMeta.map(function (meta) {
      return {
        name: meta.NAME,
        version: meta.VERSION,
        description: meta.DESC,
        arch: meta.ARCH
      }
    })
  })
}

export default class PacmanPackageCollection {
  async cachePackages (dbPath) {
    this.cachedPackages = await parsePacmanDatabase(dbPath)
  }

  async load () {
    return this.cachedPackages || parsePacmanDatabase(this.store.config.pacmanDBPath)
  }

  constructor (store) {
    this.store = store
  }
}
