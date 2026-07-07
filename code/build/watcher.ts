import fs from 'node:fs/promises'

import { bulkBindWatcher, bulkBuild, getBuildManagers } from './managers.ts'
import { initBrowserSync } from './sync.ts'
import { IntegrityError } from '../common/errors.ts'
import { readConfig } from '../server/config.ts'

await fs.rm('./build', { recursive: true, force: true })

try {
  await bulkBuild(
    getBuildManagers({ sourceMaps: true, prod: false, loggerLevel: 'WARN' }),
  )
} catch (err) {
  // eslint-disable-next-line no-console
  console.error(err)
}

const config = await readConfig()

if ('socket' in config.server) {
  throw new IntegrityError('BrowserSync does not support proxying Unix domain sockets')
}

const sync = initBrowserSync(config.server.port)

await bulkBindWatcher(
  getBuildManagers({ sourceMaps: true, prod: false, loggerLevel: 'INFO', sync }),
)
