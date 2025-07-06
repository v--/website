import fs from 'node:fs/promises'
import { basename, dirname, join as joinPath, relative } from 'node:path'

import { Resvg } from '@resvg/resvg-js'

import { type IBuildContext, type IBuildWorker } from '../build_worker.ts'

interface ISvgRenderBuildWorkerConfig {
  srcBase: string
  destBase: string
}

export class SvgRenderBuildWorker implements IBuildWorker {
  config: ISvgRenderBuildWorkerConfig

  constructor(config: ISvgRenderBuildWorkerConfig) {
    this.config = config
  }

  getDestPath(src: string): string {
    return joinPath(
      this.config.destBase,
      relative(this.config.srcBase, dirname(src)),
      basename(src, '.svg') + '.png',
    )
  }

  async* performBuild(src: string): AsyncIterable<IBuildContext> {
    const resvg = new Resvg(await fs.readFile(src, 'utf-8'))
    const pngBuffer = resvg.render().asPng()

    yield {
      src,
      dest: this.getDestPath(src),
      contents: pngBuffer,
    }
  }
}
