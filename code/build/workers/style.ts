import { join as joinPath, dirname, relative, basename } from 'path'
import fs from 'fs/promises'

import * as sass from 'sass'

import { BuildWorker, IBuildContext, ICleanContext } from '../build_worker.js'
import { BuildError } from '../errors'
import { repr } from '../../common/support/strings.js'

interface ISassBuildWorkerConfig {
  srcBase: string
  destBase: string
}

class StyleBuildError extends BuildError {}

export class StyleBuildWorker extends BuildWorker {
  constructor(public config: ISassBuildWorkerConfig) {
    super()
  }

  getDestPath(src: string): string {
    return joinPath(
      this.config.destBase,
      relative(this.config.srcBase, dirname(src)),
      basename(src, '.scss') + '.css'
    )
  }

  async getIndexSCSS(path: string): Promise<string> {
    let currentDir = dirname(path)
    let candidate: string

    // eslint-disable-next-line no-constant-condition
    while (true) {
      candidate = joinPath(currentDir, 'index.scss')

      try {
        await fs.stat(candidate)
        return candidate
      } catch (err) {
        const newDir = dirname(currentDir)

        if (newDir === currentDir) {
          throw new StyleBuildError(`Could not find 'index.scss' corresponding to ${repr(path)}`)
        }

        currentDir = newDir
      }
    }
  }

  async * performBuild(src: string): AsyncIterable<IBuildContext> {
    let result: sass.CompileResult
    const actualSrc = await this.getIndexSCSS(src)

    try {
      result = sass.compile(actualSrc, { style: 'compressed' })
    } catch (err) {
      if (err instanceof sass.Exception) {
        throw new StyleBuildError(String(err))
      } else {
        throw err
      }
    }

    yield {
      src,
      dest: this.getDestPath(actualSrc),
      contents: result.css
    }
  }

  async * performClean(src: string): AsyncIterable<ICleanContext> {
    yield {
      src,
      dest: this.getDestPath(src)
    }
  }
}
