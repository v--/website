import fs from 'node:fs/promises'

import { type PresentableErrorFactory } from '../../common/presentable_errors.ts'
import { type IDirectory, type IFileService } from '../../common/services/files.ts'
import { type Path } from '../../common/support/path.ts'
import { parseHtml } from '../html.ts'
import { parseMarkdown } from '../markdown.ts'

export class ServerFileService implements IFileService {
  #rootPath: Path
  #errorFactory: PresentableErrorFactory

  constructor(rootPath: Path, errorFactory: PresentableErrorFactory) {
    this.#rootPath = rootPath
    this.#errorFactory = errorFactory
  }

  updateRootPath(rootPath: Path) {
    this.#rootPath = rootPath
  }

  async readDirectory(path: Path) {
    if (path.segments.some(segment => segment.startsWith('.'))) {
      throw this.#errorFactory.create({ errorKind: 'http', code: 403 })
    }

    const fullPath = this.#rootPath.pushRight(...path.segments)

    const result: IDirectory = { path: path.toString(), entries: [] }
    let files: string[]

    try {
      files = await fs.readdir(fullPath.toString(), 'utf8')
    } catch (err) {
      if (err instanceof Error && 'code' in err && (err.code === 'ENOENT' || err.code === 'ENOTDIR')) {
        throw this.#errorFactory.create({ errorKind: 'http', code: 404 })
      } else {
        throw err
      }
    }

    for (const name of files) {
      const filePath = fullPath.pushRight(name)
      const childStat = await fs.stat(filePath.toString())

      if (name.startsWith('.')) {
        if (name === '.README.md') {
          const fileContents = await fs.readFile(filePath.toString(), 'utf-8')
          result.readme = parseMarkdown(fileContents)
        }

        if (name === '.README.html') {
          const fileContents = await fs.readFile(filePath.toString(), 'utf-8')
          result.readme = parseHtml(fileContents)
        }

        continue
      }

      result.entries.push({
        name,
        isDir: childStat.isDirectory(),
        modified: String(childStat.birthtime),
        size: childStat.size,
      })
    }

    return result
  }

  async finalize() {}
}
