import chokidar from 'chokidar'

import { sync } from './sync'
import { CodeBuilder } from './code'
import { buildSVG } from './svg'
import { buildSASS, getIndexSCSS } from './sass'
import { copyAsset } from './assets'
import { buildIcons } from './icons'

sync.init()
const codeBuilder = new CodeBuilder()

chokidar.watch(
  [
    './code/types/**/*.d',
    './code/{common,client}/**/*.{js,ts}',
  ],
  {
    ignoreInitial: true,
    ignored: /\/test_/
  },
).on('all', async(event, path) => {
  switch (event) {
    case 'add':
    case 'change':
      await codeBuilder.rebuild(path)
      sync.reload()
      break

    case 'unlink':
      await codeBuilder.remove(path)
      break
  }

})

chokidar.watch(
  './client/svgs/**/*.svg',
  { ignoreInitial: true }
).on('all', async(_event, path) => {
  await buildSVG(path)
  sync.reload()
})

chokidar.watch(
  './client/styles/*/**/*.scss',
  { ignoreInitial: true }
).on('all', async(_event, path) => {
  await buildSASS(getIndexSCSS(path))
  sync.reload()
})

chokidar.watch(
  './client/iconref.json',
  { ignoreInitial: true }
).on('all', async(_event, _path) => {
  await buildIcons()
  sync.reload()
})

chokidar.watch(
  './client/assets',
  { ignoreInitial: true }
).on('all', async(event, path) => {
  if (event === 'add' || event === 'change') {
    await copyAsset(path)
    sync.reload()
  }
})
