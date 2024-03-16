import fs from 'fs/promises'
import { dirname } from 'path'

import chokidar from 'chokidar'
import { BrowserSyncInstance } from 'browser-sync'
import { glob } from 'glob'

import { BuildWorker, IBuildContext, ICleanContext } from './build_worker.js'
import { repr } from '../common/support/strings.js'

function log(str: string, dest: NodeJS.WriteStream = process.stdout) {
  const datetime = new Date()
  dest.write(`[${datetime.toLocaleTimeString()}] ${str}`)
}

async function prepareDestDir(context: IBuildContext) {
  const destDir = dirname(context.dest)

  try {
    await fs.mkdir(destDir, { recursive: true })
  } catch (err) {
    // The above would fail if the directory exists
  }
}

async function writeDestFile(context: IBuildContext) {
  await fs.writeFile(context.dest, context.contents)
  log(`${repr(context.src)} -> ${repr(context.dest)}\n`)
}

async function removeDestFile(context: ICleanContext) {
  try {
    await fs.unlink(context.dest)
    log(`Removing ${repr(context.dest)}\n`)
  } catch (err) {
    // Unlinking will fail if the file does not exist
  }
}

interface WatcherConfig {
  builder: BuildWorker,
  basePatterns: string[],
  watchOnlyPatterns?: string[],
  buildOnlyPatterns?: string[],
  ignorePatterns?: string[],
  sync?: BrowserSyncInstance
}

export class BuildManager {
  private _chokidarWatcher: chokidar.FSWatcher | undefined
  boundListener: (event: string, path: string) => void

  constructor(public config: WatcherConfig) {
    this.boundListener = this.listener.bind(this)
  }

  bindWatcher() {
    this._chokidarWatcher = chokidar.watch(
      this.config.basePatterns.concat(this.config.watchOnlyPatterns ?? []),
      {
        ignored: this.config.ignorePatterns ?? [],
        ignoreInitial: true
      }
    )

    this._chokidarWatcher.on('all', this.boundListener)
  }

  unbindWatcher() {
    if (this._chokidarWatcher !== undefined) {
      this._chokidarWatcher.close()
    }
  }

  async buildAll() {
    const matches = await glob(
      this.config.basePatterns.concat(this.config.buildOnlyPatterns ?? []),
      { ignore: this.config.ignorePatterns ?? [] }
    )

    await Promise.all(
      matches.map(path => this.build(path))
    )

    if (this.config.sync) {
      this.config.sync.reload()
    }
  }

  private async listener(event: string, path: string) {
    switch (event) {
      case 'add':
      case 'change':
        try {
          await this.build(path)

          if (this.config.sync) {
            this.config.sync.reload()
          }
        } catch (err) {
          log(String(err), process.stderr)
        }

        break

      case 'unlink':
        await this.clean(path)
        break
    }
  }

  protected async build(path: string) {
    for await (const context of this.config.builder.performBuild(path)) {
      await prepareDestDir(context)
      await writeDestFile(context)
    }
  }

  protected async clean(path: string) {
    for await (const context of this.config.builder.performClean(path)) {
      await removeDestFile(context)
    }
  }
}
