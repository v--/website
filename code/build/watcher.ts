import fs from 'node:fs/promises'

import { bulkBindWatcher, bulkBuild, getBuildManagers } from './managers.ts'
import { initBrowserSync } from './sync.ts'
import { readConfig } from '../server/config.ts'

await fs.rm('./public', { recursive: true, force: true })
await fs.rm('./private', { recursive: true, force: true })

try {
  await bulkBuild(
    getBuildManagers({ sourceMaps: true, prod: false, loggerLevel: 'WARN' }),
  )
} catch (err) {
  // eslint-disable-next-line no-console
  console.error(err)
}

const config = await readConfig()
const sync = initBrowserSync(config.server.socket)

await bulkBindWatcher(
  getBuildManagers({ sourceMaps: true, prod: false, loggerLevel: 'INFO', sync }),
)
