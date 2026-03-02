import fs from 'node:fs/promises'
import { join as joinPath, relative } from 'node:path'

import { type IBuildContext, type IBuildWorker } from '../build_worker.ts'

interface IAssetBuildWorkerConfig {
  srcBase: string
  destBase: string
}

export class AssetBuildWorker implements IBuildWorker {
  readonly config: IAssetBuildWorkerConfig

  constructor(config: IAssetBuildWorkerConfig) {
    this.config = config
  }

  getDestPath(src: string): string {
    return joinPath(this.config.destBase, relative(this.config.srcBase, src))
  }

  async* performBuild(src: string): AsyncIterable<IBuildContext> {
    try {
      const contents = await fs.readFile(src)

      yield {
        src,
        dest: this.getDestPath(src),
        contents,
      }
    } catch (err) {
      // The "file" may be a directory, so reading may fail
    }
  }
}
