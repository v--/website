import fs from 'node:fs'

import * as lzma from 'lzma-native'
import * as tar from 'tar'

import { ManualCache } from '../../common/cache.ts'
import { type IPacmanPackage, type IPacmanRepository, type IPacmanService, PACMAN_PACKAGE_SCHEMA } from '../../common/services/pacman.ts'
import { type Path } from '../../common/support/path.ts'
import { validateSchema } from '../../common/validation.ts'

export class ServerPacmanRepositoryCache extends ManualCache<Path, IPacmanRepository> {
  override async _resolveValue(dbPath: Path) {
    return readDatabase(dbPath)
  }
}

export class ServerPacmanService implements IPacmanService {
  #cache = new ServerPacmanRepositoryCache()
  #dbPath: Path

  constructor(dbPath: Path) {
    this.#dbPath = dbPath
  }

  async preload() {
    await this.#cache.fetchAndCache(this.#dbPath)
  }

  updateDbPath(dbPath: Path) {
    this.#dbPath = dbPath
  }

  fetchRepository() {
    return this.#cache.getValue(this.#dbPath)
  }

  async finalize() {
    await this.#cache.finalize()
  }
}

function* iterPackageKeyValue(buffer: Buffer): Generator<[string, string]> {
  const source = buffer.toString('utf-8')

  let keyName = ''
  let content = ''

  for (const line of source.split('\n')) {
    if (line === '') {
      yield [keyName, content]
      content = ''
    }

    const match = line.match(/%(\w+)%/)

    if (match) {
      keyName = match[1]
    } else if (line) {
      content += line
    }
  }
}

function parsePackage(buffer: Buffer): IPacmanPackage {
  const pkg: Record<string, string> = {}

  for (const [key, value] of iterPackageKeyValue(buffer)) {
    switch (key) {
      case 'NAME':
        pkg.name = value
        break

      case 'DESC':
        pkg.description = value
        break

      case 'VERSION':
        pkg.version = value
        break

      case 'ARCH':
        pkg.arch = value
        break
    }
  }

  return validateSchema(PACMAN_PACKAGE_SCHEMA, pkg)
}

function readDatabase(dbPath: Path): Promise<IPacmanRepository> {
  const packages: IPacmanPackage[] = []

  return new Promise((resolve, reject) => {
    fs.createReadStream(dbPath.toString())
      .pipe(lzma.createDecompressor())
      .pipe(new tar.Parser())
      .on('entry', function (entry: tar.ReadEntry) {
        if (entry.type != 'File') {
          entry.resume()
        }

        entry
          .on('data', function (data) {
            const pkg = parsePackage(data)
            packages.push(pkg)
          })
          .on('error', function (err) {
            reject(err)
          })
      })
      .on('error', function (err) {
        reject(err)
      })
      .on('end', function () {
        resolve({ packages })
      })
  })
}
