import { spawn } from 'child_process'

/**
 * @param {NodeJS.ReadableStream} stream
 * @returns {Promise<TPacmanPackages.IPackage[]>}
 */
function parsePacmanInfoStream(stream) {
  return new Promise(function(resolve, reject) {
    /** @type {string[]} */
    let buffer = []

    stream
      .setEncoding('utf8')
      .on('data', function(data) {
        buffer.push(data)
      })
      .on('error', reject)
      .on('end', function() {
        resolve(JSON.parse(buffer.join('')))
      })
  })
}

/**
 * @param {string} repoName
 * @returns {Promise<TPacmanPackages.IPackage[]>}
 */
async function parsePacmanDatabase(repoName) {
  const proc = spawn('python', ['-m', 'dump_package_info', repoName])
  return await parsePacmanInfoStream(proc.stdout)
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
