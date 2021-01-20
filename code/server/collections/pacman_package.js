import { spawn } from 'child_process'

/**
 * @typedef {object} IPacmanPackageMetadata
 * @property {string} NAME
 * @property {string} VERSION
 * @property {string} DESC
 * @property {string} ARCH
 */

/**
 * @param {NodeJS.ReadableStream} stream
 * @returns {Promise<IPacmanPackageMetadata[]>}
 */
function parsePacmanInfoStream(stream) {
  return new Promise(function(resolve, reject) {
    let key = ''
    let inTitle = false

    /** @type {string[]} */
    let buffer = []

    /** @type {Record<string, string>} */
    let currentFile = {}

    /** @type {IPacmanPackageMetadata[]} */
    const files = []

    stream
      .setEncoding('utf8')
      .on('data', function(data) {
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
                  if (Object.keys(currentFile).length > 0) {
                    files.push({
                      NAME: '',
                      VERSION: '',
                      DESC: '',
                      ARCH: '',
                      ...currentFile
                    })
                  }

                  currentFile = {}
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
      .on('end', function() {
        resolve(files)
      })
  })
}

/**
 * @param {string} path
 * @returns {Promise<TPacmanPackages.IPackage[]>}
 */
async function parsePacmanDatabase(path) {
  const proc = spawn('/usr/bin/tar', ['--extract', '--file', path, '--to-stdout'])
  const packageMeta = await parsePacmanInfoStream(proc.stdout)

  return packageMeta.map(function(meta) {
    return {
      name: meta.NAME,
      version: meta.VERSION,
      description: meta.DESC,
      arch: /** @type {TPacmanPackages.Architecture} */ (meta.ARCH)
    }
  })
}

/**
 * @implements TStore.IPacmanPackageCollection
 */
export class PacmanPackageCollection {
  /**
   * @param {string} pacmanDBPath
   */
  constructor(pacmanDBPath) {
    this.pacmanDBPath = pacmanDBPath

    /** @type {TPacmanPackages.IPackage[] | undefined} */
    this.cachedPackages = undefined
  }

  /**
   * @param {string} dbPath
   */
  async updateDBPath(dbPath) {
    this.pacmanDBPath = dbPath
  }

  async cachePackages() {
    this.cachedPackages = await parsePacmanDatabase(this.pacmanDBPath)
  }

  async load() {
    return this.cachedPackages || parsePacmanDatabase(this.pacmanDBPath)
  }
}
