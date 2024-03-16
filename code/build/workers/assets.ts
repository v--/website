import { join as joinPath, relative } from 'path'
import fs from 'fs/promises'

import { BuildWorker, IBuildContext, ICleanContext } from '../build_worker.js'

interface IAssetBuildWorkerConfig {
  srcBase: string
  destBase: string
}

export class AssetBuildWorker extends BuildWorker {
  constructor(public config: IAssetBuildWorkerConfig) {
    super()
  }

  getDestPath(src: string): string {
    return joinPath(this.config.destBase, relative(this.config.srcBase, src))
  }

  async * performBuild(src: string): AsyncIterable<IBuildContext> {
    try {
      const contents = await fs.readFile(src)

      yield {
        src,
        dest: this.getDestPath(src),
        contents
      }
    } catch (err) {
      // The "file" may be a directory, so reading may fail
    }
  }

  async * performClean(src: string): AsyncIterable<ICleanContext> {
    yield {
      src,
      dest: this.getDestPath(src)
    }
  }
}
