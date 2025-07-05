import { type ParsedPath } from 'node:path'

import { type BrowserSyncInstance } from 'browser-sync'

import { BuildManager } from './build_manager.ts'
import { AssetIBuildWorker } from './workers/assets.ts'
import { CodeBuildWorker } from './workers/code.ts'
import { IconBuildWorker } from './workers/icons.ts'
import { StyleBuildWorker } from './workers/style.ts'
import { SvgOptBuildWorker } from './workers/svg_opt.ts'
import { SvgRenderBuildWorker } from './workers/svg_render.ts'
import { type LoggerLevel } from '../common/logger.ts'
import { TranslationIBuildWorker } from './workers/translation.ts'

interface GetBuildManagersConfig {
  sourceMaps: boolean
  sync?: BrowserSyncInstance
  loggerLevel: LoggerLevel
  // The dev flag is needed only to check whether the BrowserSync script is to be ignored.
  // It cannot be replaced by a check of whether there is a BrowserSync instance
  // because then the initial build of the watcher will fail. We can pass an instance on initial build,
  // but that would be more of a hack than this is.
  dev: boolean
}

export function getBuildManagers(config: GetBuildManagersConfig) {
  return Array.from(iterBuildManagers(config))
}

function* iterBuildManagers({ loggerLevel, sourceMaps, sync, dev }: GetBuildManagersConfig) {
  yield new BuildManager({
    builder: new CodeBuildWorker({ sourceMaps, srcBase: 'code', destBase: 'public/code' }),
    paths: ['code/common', 'code/client'],
    ext: ['.ts'],
    loggerLevel, sync,
    ignore(path: ParsedPath) {
      return path.name === 'eslint.config' ||
        path.name.startsWith('test_') ||
        (!dev && path.name === 'browsersync_injection')
    },
  })

  yield new BuildManager({
    builder: new StyleBuildWorker({ sourceMaps, srcBase: 'client/styles', destBase: 'public/styles' }),
    paths: ['client/styles'],
    ext: ['.scss'],
    ignoreOnBulkBuild(path: ParsedPath) {
      return path.name !== 'index'
    },
    loggerLevel, sync,
  })

  yield new BuildManager({
    builder: new SvgRenderBuildWorker({ srcBase: 'client/svgs', destBase: 'public/images' }),
    paths: ['client/svgs/favicon.svg'],
    loggerLevel, sync,
  })

  yield new BuildManager({
    builder: new SvgOptBuildWorker({ srcBase: 'client/svgs', destBase: 'public/images' }),
    paths: ['client/svgs'],
    ext: ['.svg'],
    loggerLevel, sync,
  })

  yield new BuildManager({
    builder: new AssetIBuildWorker({ srcBase: 'client/assets', destBase: 'public' }),
    paths: ['client/assets'],
    loggerLevel, sync,
  })

  yield new BuildManager({
    builder: new IconBuildWorker({ srcBase: 'data/iconref', destBase: 'private/iconref' }),
    paths: ['data/iconref'],
    ext: ['.json'],
    loggerLevel, sync,
  })

  yield new BuildManager({
    builder: new TranslationIBuildWorker({ srcBase: 'data/translation', destBase: 'private/translation' }),
    paths: ['data/translation'],
    ext: ['.json'],
    loggerLevel, sync,
  })
}

export async function bulkBuild(managers: BuildManager[]) {
  return Promise.all(managers.map(manager => manager.bulkBuild()))
}

export async function bulkBindWatcher(managers: BuildManager[]) {
  return Promise.all(managers.map(manager => manager.bindWatcher()))
}
