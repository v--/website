import fs from 'node:fs/promises'

import { bulkBuild, getBuildManagers } from './managers.ts'

await fs.rm('./build', { recursive: true, force: true })

await bulkBuild(
  getBuildManagers({ sourceMaps: false, prod: true, loggerLevel: 'WARN' }),
)
