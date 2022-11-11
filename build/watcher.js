import chokidar from 'chokidar'

import { sync } from './sync.js'
import { buildSVG } from './svg.js'
import { buildSASS, getIndexSCSS } from './sass.js'
import { copyAsset } from './assets.js'
import { buildIcons } from './icons.js'

sync.init()

chokidar.watch(
  [
    'code/types/**/*.d.ts',
    'code/{common,client}/**/*.js'
  ],
  { ignoreInitial: true },
).on('all', (_event, _path) => {
  sync.reload()
})

chokidar.watch(
  'client/svgs/**/*.svg',
  { ignoreInitial: true }
).on('all', async(_event, path) => {
  await buildSVG(path)
  sync.reload()
})

chokidar.watch(
  'client/styles/*/**/*.scss',
  { ignoreInitial: true }
).on('all', async(_event, path) => {
  await buildSASS(getIndexSCSS(path))
  sync.reload()
})

chokidar.watch(
  'client/iconref.json',
  { ignoreInitial: true }
).on('all', async(_event, path) => {
  await buildIcons()
  sync.reload()
})

chokidar.watch(
  'client/assets',
  { ignoreInitial: true }
).on('all', async(event, path) => {
  if (event === 'add' || event === 'change') {
    await copyAsset(path)
    sync.reload()
  }
})
