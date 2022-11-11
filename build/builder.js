import { buildIcons } from './icons.js'
import { buildAllSASS } from './sass.js'
import { buildAllSVG } from './svg.js'
import { buildAssets } from './assets.js'

await Promise.all([
  buildAllSVG(),
  buildAllSASS(),
  buildIcons(),
  buildAssets()
])
