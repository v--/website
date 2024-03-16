import { join as joinPath, relative } from 'path'
import fs from 'fs/promises'

import svgo from 'svgo'

import { BuildWorker, IBuildContext, ICleanContext } from '../build_worker.js'

interface ISvgBuildWorkerConfig {
  srcBase: string
  destBase: string
}

export class SvgBuildWorker extends BuildWorker {
  constructor(public config: ISvgBuildWorkerConfig) {
    super()
  }

  getDestPath(src: string): string {
    return joinPath(this.config.destBase, relative(this.config.srcBase, src))
  }

  async * performBuild(src: string): AsyncIterable<IBuildContext> {
    const string = await fs.readFile(src, { encoding: 'utf8' })
    const optimized = svgo.optimize(string, { path: src })

    yield {
      src,
      dest: this.getDestPath(src),
      contents: optimized.data
    }
  }

  async * performClean(src: string): AsyncIterable<ICleanContext> {
    yield {
      src,
      dest: this.getDestPath(src)
    }
  }
}
