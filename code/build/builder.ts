import fs from 'node:fs/promises'

import { bulkBuild, getBuildManagers } from './managers.ts'

await fs.rm('./public', { recursive: true })
await fs.rm('./private', { recursive: true })

await bulkBuild(
  getBuildManagers({ sourceMaps: false, dev: false, loggerLevel: 'WARN' }),
)
