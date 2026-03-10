import path from 'node:path'

import { type PreRenderedChunk } from 'rollup'

import { CoolError } from './common/errors.ts'
import { PLAYGROUND_PAGE_IDS } from './common/types/bundles.ts'

const codeBasePath = path.resolve('build/intermediate/code')
const entryPoints = ['runtime', ...PLAYGROUND_PAGE_IDS].map(bundleId => path.join(codeBasePath, 'client', bundleId + '.js'))
const CHUNK_NAMES = ['core', 'runtime', ...PLAYGROUND_PAGE_IDS]

class BundlingError extends CoolError {}

// eslint-disable-next-line no-restricted-syntax
export default [
  {
    input: entryPoints,
    output: {
      dir: 'build/public/code',
      format: 'es',
      compact: true,
      minifyInternalExports: false,
      manualChunks(id: string) {
        if (id.startsWith(path.join(codeBasePath, 'common'))) {
          return 'common'
        }

        for (const bundleId of CHUNK_NAMES) {
          if (id.startsWith(path.join(codeBasePath, 'client', bundleId))) {
            return path.join('client', bundleId)
          }
        }

        throw new BundlingError(`Could not determine chunk for ${id}`)
      },

      chunkFileNames(chunkInfo: PreRenderedChunk) {
        return path.join(chunkInfo.name + '.js')
      },

      entryFileNames(chunkInfo: PreRenderedChunk) {
        return path.join('client', chunkInfo.name + '.js')
      },
    },
  },
]
