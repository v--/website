import { type KnipConfig } from 'knip'

import { PLAYGROUND_PAGE_IDS } from './common/types/bundles.ts'

const config: KnipConfig = {
  entry: [
    'code/**/test_*.ts',
    'code/benchmarks/bench_*.ts',
    'code/benchmarks/benchmark.ts',
    'code/build/{builder,watcher}.ts',
    'code/client/browsersync_injection.ts',
    'code/client/preload.ts',
    'code/client/runtime.ts',
    'code/testing/*/setup.ts',
    'code/testing/cli.ts',
    ...PLAYGROUND_PAGE_IDS.flatMap(pageId => [`code/client/${pageId}.ts`, `code/client/${pageId}/index.ts`]),

    // Configurations
    'code/rollup.config.ts',
  ],

  project: [
    'code/**/*.ts',
  ],

  ignoreDependencies: [
    '@boxicons/core',
  ],
}

// eslint-disable-next-line no-restricted-syntax
export default config
