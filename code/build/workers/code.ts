import { readFile } from 'node:fs/promises'
import { basename, dirname, join as joinPath, relative, resolve as resolvePath } from 'node:path'

import * as swc from '@swc/core'

import { waitForTime } from '../../common/support/async.ts'
import { type IBuildContext, type IBuildWorker } from '../build_worker.ts'
import { BuildError } from '../errors.ts'

const SWC_TRANSFORM_OPTIONS: swc.Options = {
  jsc: {
    target: 'esnext',
    parser: { syntax: 'typescript' },
    minify: {
      mangle: false,
      compress: false,
      format: {
        comments: false,
      },
    },
  },
}

class CodeBuildError extends BuildError {}

export interface ICodeBuildWorkerConfig {
  srcBase: string
  destBase: string
  sourceMaps: boolean
}

export class CodeBuildWorker implements IBuildWorker {
  readonly config: ICodeBuildWorkerConfig

  constructor(config: ICodeBuildWorkerConfig) {
    this.config = config
  }

  #getDestFileName(src: string, ext: string): string {
    return basename(src, '.ts') + ext
  }

  #getFullDestPath(src: string, ext: string): string {
    return joinPath(
      this.config.destBase,
      relative(this.config.srcBase, dirname(src)),
      this.#getDestFileName(src, ext),
    )
  }

  async performBuildStep(src: string): Promise<swc.Output> {
    let input = ''

    // For whatever reason, the file read is sometimes empty.
    // Perhaps it is a grotesque race condition with either my editor or node's own watcher.
    while (input.length === 0) {
      await waitForTime(10)
      input = await readFile(src, 'utf-8')
    }

    const preTransformed = input.replace(/\.ts'/g, '.js\'')

    try {
      return await swc.transform(preTransformed, {
        ...SWC_TRANSFORM_OPTIONS,
        sourceFileName: 'file://' + resolvePath(src),
        sourceMaps: this.config.sourceMaps,
        // Minification, as configured, only removes whitespace, however the sourcemaps generated by swc become defective
        minify: !this.config.sourceMaps,
      })
    } catch (err) {
      if (err instanceof Object && 'message' in err && 'snippet' in err) {
        throw new CodeBuildError(`Compilation error: ${err.message}. ${err.snippet}`)
      }

      throw err
    }
  }

  async* performBuild(src: string): AsyncIterable<IBuildContext> {
    const buildResult = await this.performBuildStep(src)

    if (buildResult.map) {
      const sourceMappingUrl = this.#getDestFileName(src, '.js.map')

      yield {
        src,
        dest: this.#getFullDestPath(src, '.js'),
        contents: buildResult.code + `//# sourceMappingURL=${sourceMappingUrl}`,
      }

      yield {
        src,
        dest: this.#getFullDestPath(src, '.js.map'),
        contents: buildResult.map,
      }
    } else {
      yield {
        src,
        dest: this.#getFullDestPath(src, '.js'),
        contents: buildResult.code,
      }
    }
  }
}
