import { spawn } from 'child_process'

import { IPacmanPackage, PacmanPackageArchitecture } from '../../common/types/pacman_packages.js'
import { IPacmanPackageCollection } from '../../common/types/store.js'

interface IPacmanPackageMetadata {
  NAME: string
  VERSION: string
  DESC: string
  ARCH: string
}

function parsePacmanInfoStream(stream: NodeJS.ReadableStream): Promise<IPacmanPackageMetadata[]> {
  return new Promise(function(resolve, reject) {
    let buffer: string[] = []
    let key = ''
    let inTitle = false
    let currentFile: Record<string, string> = {}

    const files: IPacmanPackageMetadata[] = []

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

async function parsePacmanDatabase(path: string): Promise<IPacmanPackage[]> {
  const proc = spawn('/usr/bin/tar', ['--extract', '--file', path, '--to-stdout'])
  const packageMeta = await parsePacmanInfoStream(proc.stdout)

  return packageMeta.map(function(meta) {
    return {
      name: meta.NAME,
      version: meta.VERSION,
      description: meta.DESC,
      arch: meta.ARCH as PacmanPackageArchitecture
    }
  })
}

export class PacmanPackageCollection implements IPacmanPackageCollection {
  cachedPackages?: IPacmanPackage[]

  constructor(
    public pacmanDBPath: string
  ) {}

  async updateDBPath(dbPath: string) {
    this.pacmanDBPath = dbPath
  }

  async cachePackages() {
    this.cachedPackages = await parsePacmanDatabase(this.pacmanDBPath)
  }

  async load() {
    return this.cachedPackages || parsePacmanDatabase(this.pacmanDBPath)
  }
}
