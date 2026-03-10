import { type Stats } from 'node:fs'
import fs from 'node:fs/promises'
import { type ParsedPath, dirname, join as pathJoin, parse as parsePath } from 'node:path'

import { type BrowserSyncInstance } from 'browser-sync'
import { type FSWatcher, watch as chokidarWatch } from 'chokidar'

import { type IBuildContext, type IBuildWorker } from './build_worker.ts'
import { reloadBrowserSync, reloadServerData, waitForServer } from './sync.ts'
import { type LoggerLevel } from '../common/logger.ts'
import { repr } from '../common/support/strings.ts'
import { ServerLogger } from '../server/logger.ts'

interface BuildManagerConfig {
  builder: IBuildWorker
  paths: string[]
  ext?: string[]
  sync?: BrowserSyncInstance
  ignore?(path: ParsedPath): boolean
  ignoreOnBulkBuild?(path: ParsedPath): boolean
  loggerLevel: LoggerLevel
}

export class BuildManager {
  #chokidarBuildManager: FSWatcher | undefined
  #syncListener: (event: string, path: string) => void
  readonly config: BuildManagerConfig
  readonly logger: ServerLogger

  constructor(config: BuildManagerConfig) {
    this.logger = new ServerLogger(config.builder.constructor.name, config.loggerLevel)
    this.config = config

    this.#syncListener = (event: string, path: string) => {
      this.#asyncListener(event, path).catch(err => {
        this.logger.error(`Error while handling ${repr(event)} on ${repr(path)}`, err)
      })
    }
  }

  ignoreFileMatcher(path: string, stats?: Stats) {
    if (stats === undefined || stats.isDirectory()) {
      return false
    }

    if (this.config.ext) {
      if (!this.config.ext.some(e => path.endsWith(e))) {
        return true
      }

      if (this.config.ignore) {
        return this.config.ignore(parsePath(path))
      }

      return false
    } else {
      return false
    }
  }

  bindWatcher() {
    this.#chokidarBuildManager = chokidarWatch(
      this.config.paths,
      {
        ignored: this.ignoreFileMatcher.bind(this),
        ignoreInitial: true,
      },
    )

    this.#chokidarBuildManager.on('all', this.#syncListener)
  }

  async #prepareDestDir(context: IBuildContext) {
    const destDir = dirname(context.dest)

    try {
      await fs.mkdir(destDir, { recursive: true })
    } catch (err) {
      // The above would fail if the directory exists
    }
  }

  async #writeDestFile(context: IBuildContext) {
    // TypeScript misbehaves without a case here
    await fs.writeFile(context.dest, context.contents as unknown as string)
    this.logger.info(`${repr(context.src)} -> ${repr(context.dest)}`)
  }

  async unbindBuildManager() {
    if (this.#chokidarBuildManager !== undefined) {
      await this.#chokidarBuildManager.close()
    }
  }

  async* listFiles(path: string): AsyncIterable<string> {
    const stat = await fs.stat(path)

    if (stat.isDirectory()) {
      for (const subpath of await fs.readdir(path)) {
        yield* this.listFiles(pathJoin(path, subpath))
      }
    } else if (!this.ignoreFileMatcher(path, stat)) {
      yield path
    }
  }

  async listAllFiles(): Promise<string[]> {
    const result: string[] = []

    for (const path of this.config.paths) {
      const newPaths = await Array.fromAsync(this.listFiles(path))
      result.push(...newPaths)
    }

    return result
  }

  async bulkBuild() {
    const matches = await this.listAllFiles()
    const { ignoreOnBulkBuild } = this.config
    const filtered = ignoreOnBulkBuild ? matches.filter(path => !ignoreOnBulkBuild(parsePath(path))) : matches

    await Promise.all(
      filtered.map(path => Array.fromAsync(this.#build(path))),
    )

    if (this.config.sync) {
      this.config.sync.reload()
    }
  }

  async #asyncListener(event: string, path: string) {
    switch (event) {
      case 'add':
      case 'change': {
        const buildContexts = await Array.fromAsync(this.#build(path))
        await reloadServerData(buildContexts)

        if (this.config.sync) {
          await waitForServer(this.config.sync, buildContexts)
          await reloadBrowserSync(this.config.sync, buildContexts)
        }

        break
      }
    }
  }

  async* #build(path: string) {
    for await (const context of this.config.builder.performBuild(path)) {
      await this.#prepareDestDir(context)
      await this.#writeDestFile(context)
      yield context
    }
  }
}
