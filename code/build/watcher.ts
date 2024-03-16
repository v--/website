import { initBrowserSync } from './sync'
import { iterBuildManagers } from './managers'

// Forgive me, father, for breaking encapsulation
import { config } from '../server/config'

const sync = initBrowserSync(config.server.socket)

for (const manager of iterBuildManagers(sync)) {
  // manager.buildAll()
  manager.bindWatcher()
}
