import fs from 'node:fs/promises'

import { PresentableError } from '../../common/presentable_errors.ts'
import { type IDirectory, type IFileService } from '../../common/services/files.ts'
import { type Path } from '../../common/support/path.ts'
import { parseHtml } from '../html.ts'
import { parseMarkdown } from '../markdown.ts'
import { LANGUAGE_IDS } from '../../common/translation.ts'
import { includes } from '../../common/support/iteration.ts'

export class ServerFileService implements IFileService {
  #rootPath: Path

  constructor(rootPath: Path) {
    this.#rootPath = rootPath
  }

  updateRootPath(rootPath: Path) {
    this.#rootPath = rootPath
  }

  async readDirectory(path: Path) {
    if (path.segments.some(segment => segment.startsWith('.'))) {
      throw new PresentableError({ errorKind: 'http', code: 403 })
    }

    const fullPath = this.#rootPath.pushRight(...path.segments)

    const result: IDirectory = { path: path.toString(), entries: [] }
    let files: string[]

    try {
      files = await fs.readdir(fullPath.toString(), 'utf8')
    } catch (err) {
      if (err instanceof Error && 'code' in err && (err.code === 'ENOENT' || err.code === 'ENOTDIR')) {
        throw new PresentableError({ errorKind: 'http', code: 404 })
      } else {
        throw err
      }
    }

    for (const name of files) {
      const filePath = fullPath.pushRight(name)
      const childStat = await fs.stat(filePath.toString())

      if (name.startsWith('.')) {
        const match = name.match(/^.README_(?<lang>[a-z]+)\.(?<ext>(md)|(html))$/)

        if (match === null || match.groups === undefined || !includes(LANGUAGE_IDS, match.groups.lang)) {
          continue
        }

        switch (match.groups.ext) {
          case 'md': {
            const fileContents = await fs.readFile(filePath.toString(), 'utf-8')
            result.readme = {
              languageId: match.groups.lang,
              doc: parseMarkdown(fileContents),
            }

            break
          }

          case 'html': {
            const fileContents = await fs.readFile(filePath.toString(), 'utf-8')
            result.readme = {
              languageId: match.groups.lang,
              doc: parseHtml(fileContents),
            }

            break
          }
        }

        continue
      }

      result.entries.push({
        name,
        isDir: childStat.isDirectory(),
        size: childStat.size,
      })
    }

    return result
  }

  async finalize() {}
}
