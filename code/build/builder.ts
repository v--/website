import fs from 'node:fs/promises'

import { bulkBuild, getBuildManagers } from './managers.ts'

await fs.rm('./public', { recursive: true, force: true })
await fs.rm('./private', { recursive: true, force: true })

await bulkBuild(
  getBuildManagers({ sourceMaps: false, prod: true, loggerLevel: 'WARN' }),
)
