import fs from 'node:fs/promises'
import { relative } from 'node:path'

import { LANGUAGE_IDS } from '../../common/languages.ts'
import { PresentableError } from '../../common/presentable-errors.ts'
import { type IDirectory, type IFileService } from '../../common/services/files.ts'
import { includes } from '../../common/support/iteration.ts'
import { type Path } from '../../common/support/path.ts'
import { repr } from '../../common/support/strings.ts'
import { parseHtml } from '../html.ts'
import { type ServerLogger } from '../logger.ts'
import { parseMarkdown } from '../markdown.ts'

export class ServerFileService implements IFileService {
  readonly logger: ServerLogger
  #rootPath: Path

  constructor(rootPath: Path, logger: ServerLogger) {
    this.#rootPath = rootPath
    this.logger = logger
  }

  updateRootPath(rootPath: Path) {
    this.#rootPath = rootPath
  }

  async readDirectory(path: Path) {
    const fullPath = this.#rootPath.pushRight(...path.segments)

    // Handle parent directory traversal cleanly.
    // The next check catches actual traversal attacks by accident, but this check feels safer.
    if (relative(this.#rootPath.toString(), fullPath.toString()).startsWith('..')) {
      throw new PresentableError({ errorKind: 'http', code: 403 })
    }

    // We forbid listing the contents of directories that start with a dot, even if they don't exist.
    if (path.segments.some(segment => segment.startsWith('.'))) {
      throw new PresentableError({ errorKind: 'http', code: 403 })
    }

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
        const match = name.match(/^.README(_|-)(?<lang>[a-z]+)\.(?<ext>[a-z]+)$/)

        if (match === null || match.groups === undefined) {
          continue
        }

        if (!includes(LANGUAGE_IDS, match.groups.lang)) {
          this.logger.warn(`Unrecognized README file language ${repr(match.groups.lang)}.`)
          continue
        }

        if (result.readme) {
          this.logger.warn('Multiple README files detected in directory.', { fullPath })
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

          default:
            this.logger.warn(`Don't know how to handle README file with extension ${repr(match.groups.ext)}.`)
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

  async [Symbol.asyncDispose]() {}
}
