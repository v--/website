import { type ParsedPath } from 'node:path'

import { type BrowserSyncInstance } from 'browser-sync'

import { BuildManager } from './build_manager.ts'
import { AssetIBuildWorker } from './workers/assets.ts'
import { CodeBuildWorker } from './workers/code.ts'
import { IconRefBuildWorker } from './workers/icon_refs.ts'
import { OGImageBuildWorker } from './workers/og_image.ts'
import { StyleBuildWorker } from './workers/style.ts'
import { SvgOptBuildWorker } from './workers/svg_opt.ts'
import { SvgRenderBuildWorker } from './workers/svg_render.ts'
import { type LoggerLevel } from '../common/logger.ts'
import { TranslationMapBuildWorker } from './workers/translation_maps.ts'

interface GetBuildManagersConfig {
  sourceMaps: boolean
  sync?: BrowserSyncInstance
  loggerLevel: LoggerLevel
  prod: boolean
}

export function getBuildManagers(config: GetBuildManagersConfig) {
  return Array.from(iterBuildManagers(config))
}

function* iterBuildManagers({ loggerLevel, sourceMaps, sync, prod }: GetBuildManagersConfig) {
  yield new BuildManager({
    builder: new CodeBuildWorker({ sourceMaps, srcBase: 'code', destBase: 'public/code' }),
    paths: ['code/common', 'code/client'],
    ext: ['.ts'],
    loggerLevel, sync,
    ignore(path: ParsedPath) {
      return path.name === 'eslint.config' ||
        path.name.startsWith('test_') ||
        (prod && path.name === 'browsersync_injection')
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
    builder: new SvgRenderBuildWorker({ srcBase: 'client/svg', destBase: 'public/images' }),
    paths: ['client/svg/favicon.svg'],
    ext: ['.svg'],
    loggerLevel, sync,
  })

  yield new BuildManager({
    builder: new SvgOptBuildWorker({ srcBase: 'client/svg', destBase: 'public/images' }),
    paths: ['client/svg'],
    ext: ['.svg'],
    loggerLevel, sync,
  })

  if (prod) {
    yield new BuildManager({
      builder: new OGImageBuildWorker({ srcBase: 'data/og_images', destBase: 'public/images/open_graph' }),
      paths: ['data/og_images/config.json'],
      loggerLevel, sync,
    })
  }

  yield new BuildManager({
    builder: new AssetIBuildWorker({ srcBase: 'client/assets', destBase: 'public' }),
    paths: ['client/assets'],
    loggerLevel, sync,
  })

  yield new BuildManager({
    builder: new IconRefBuildWorker({ srcBase: 'data/icon_ref', destBase: 'private/icon_ref' }),
    paths: ['data/icon_ref'],
    ext: ['.json'],
    loggerLevel, sync,
  })

  yield new BuildManager({
    builder: new TranslationMapBuildWorker({ srcBase: 'data/translation', destBase: 'private/translation' }),
    paths: ['data/translation'],
    ext: ['.json'],
    loggerLevel, sync,
  })
}

export async function bulkBuild(managers: BuildManager[]) {
  return Promise.all(managers.map(manager => manager.bulkBuild()))
}

export async function bulkBindWatcher(managers: BuildManager[]) {
  return Promise.all(managers.map(manager => Promise.resolve(manager.bindWatcher())))
}
