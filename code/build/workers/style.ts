import fs from 'node:fs/promises'
import { basename, dirname, join as joinPath, relative } from 'node:path'

import * as sass from 'sass'

import { type IBuildContext, type IBuildWorker } from '../build_worker.ts'
import { BuildError } from '../errors.ts'

class StyleBuildError extends BuildError {}

export interface IStyleBuildWorkerConfig {
  srcBase: string
  destBase: string
  sourceMaps: boolean
}

export class StyleBuildWorker implements IBuildWorker {
  readonly config: IStyleBuildWorkerConfig

  constructor(config: IStyleBuildWorkerConfig) {
    this.config = config
  }

  #getFullDestPath(src: string, ext: string): string {
    return joinPath(
      this.config.destBase,
      relative(this.config.srcBase, dirname(src)) + ext,
    )
  }

  async* #iterIndexScss(base?: string): AsyncGenerator<string> {
    if (base === undefined) {
      base = this.config.srcBase
    }

    for (const path of await fs.readdir(base)) {
      const fullPath = joinPath(base, path)
      const stat = await fs.stat(fullPath)

      if (stat.isDirectory()) {
        yield* this.#iterIndexScss(fullPath)
      } else if (path === 'index.scss') {
        yield fullPath
      }
    }
  }

  async* #iterMatchingIndexScss(scssPath: string): AsyncGenerator<string> {
    const currentDir = dirname(scssPath)
    const indexFiles = await Array.fromAsync(this.#iterIndexScss())

    for (const indexPath of indexFiles) {
      if (currentDir.startsWith(dirname(indexPath))) {
        yield indexPath
        return
      }
    }

    yield* indexFiles
  }

  async* performBuildStep(src: string): AsyncGenerator<{ matchingIndex: string, buildResult: sass.CompileResult }> {
    for await (const matchingIndex of this.#iterMatchingIndexScss(src)) {
      try {
        const buildResult = await sass.compileAsync(matchingIndex, {
          style: 'compressed',
          sourceMap: this.config.sourceMaps,
          sourceMapIncludeSources: true,
        })

        yield { buildResult, matchingIndex }
      } catch (err) {
        if (err instanceof sass.Exception) {
          throw new StyleBuildError(String(err))
        } else {
          throw err
        }
      }
    }
  }

  async* performBuild(src: string): AsyncIterable<IBuildContext> {
    for await (const { buildResult, matchingIndex } of this.performBuildStep(src)) {
      if (buildResult.sourceMap) {
        const sourceMappingUrl = basename(dirname(matchingIndex)) + '.css.map'

        yield {
          src: matchingIndex,
          dest: this.#getFullDestPath(matchingIndex, '.css'),
          contents: buildResult.css + `/*# sourceMappingURL=${sourceMappingUrl} */`,
        }

        yield {
          src: matchingIndex,
          dest: this.#getFullDestPath(matchingIndex, '.css.map'),
          contents: JSON.stringify(buildResult.sourceMap),
        }
      } else {
        yield {
          src: matchingIndex,
          dest: this.#getFullDestPath(matchingIndex, '.css'),
          contents: buildResult.css,
        }
      }
    }
  }
}
