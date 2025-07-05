import fs from 'node:fs/promises'
import { join as joinPath, relative } from 'node:path'

import { optimize as svgoOptimize } from 'svgo'

import { type IBuildContext, type IBuildWorker } from '../build_worker.ts'

interface ISvgOptBuildWorkerConfig {
  srcBase: string
  destBase: string
}

export class SvgOptBuildWorker implements IBuildWorker {
  readonly config: ISvgOptBuildWorkerConfig

  constructor(config: ISvgOptBuildWorkerConfig) {
    this.config = config
  }

  getDestPath(src: string): string {
    return joinPath(this.config.destBase, relative(this.config.srcBase, src))
  }

  async* performBuild(src: string): AsyncIterable<IBuildContext> {
    const string = await fs.readFile(src, { encoding: 'utf8' })
    const optimized = svgoOptimize(string, { path: src })

    yield {
      src,
      dest: this.getDestPath(src),
      contents: optimized.data,
    }
  }
}
