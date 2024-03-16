import { BuildManager } from './build_manager.js'
import { CodeBuildWorker } from './workers/code.js'
import { iterBuildManagers } from './managers.js'

function * iterExtendedBuildManagers() {
  yield new BuildManager({
    builder: new CodeBuildWorker({ srcBase: './code', destBase: './private/code' }),
    basePatterns: ['./code/types/**/*.d', './code/{common,server}/**/*.{js,ts}'],
    ignorePatterns: ['**/test_*.{js,ts}']
  })

  yield * iterBuildManagers()
}

await Promise.all(
  Array.from(iterExtendedBuildManagers()).map(watcher => watcher.buildAll())
)
