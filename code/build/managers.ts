import { BrowserSyncInstance } from 'browser-sync'

import { BuildManager } from './build_manager.js'
import { CodeBuildWorker } from './workers/code.js'
import { StyleBuildWorker } from './workers/style.js'
import { SvgBuildWorker } from './workers/svg.js'
import { IconBuildWorker } from './workers/icons.js'
import { AssetBuildWorker } from './workers/assets.js'

export function * iterBuildManagers(sync?: BrowserSyncInstance) {
  yield new BuildManager({
    builder: new CodeBuildWorker({ srcBase: './code', destBase: './public/code' }),
    basePatterns: ['./code/types/**/*.d', './code/{common,client}/**/*.{js,ts}'],
    ignorePatterns: ['**/test_*.{js,ts}'],
    sync
  })

  yield new BuildManager({
    builder: new StyleBuildWorker({ srcBase: './client/styles', destBase: './public/styles' }),
    basePatterns: ['./client/styles/**/index.scss'],
    watchOnlyPatterns: ['./client/styles/**/*.scss'],
    ignorePatterns: ['**/_*.scss'],
    sync
  })

  yield new BuildManager({
    builder: new IconBuildWorker('./public/icons.json'),
    basePatterns: ['./client/iconref.json'],
    sync
  })

  yield new BuildManager({
    builder: new SvgBuildWorker({ srcBase: './client/svgs', destBase: './public/images' }),
    basePatterns: ['./client/svgs/**/*.svg'],
    sync
  })

  yield new BuildManager({
    builder: new AssetBuildWorker({ srcBase: './client/assets', destBase: './public' }),
    basePatterns: ['./client/assets/**'],
    sync
  })
}
