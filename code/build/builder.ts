import { buildAllCode } from './code'
import { buildAllSASS } from './sass'
import { buildAllSVG } from './svg'
import { buildIcons } from './icons'
import { buildAssets } from './assets'

await Promise.all([
  buildAllCode('./code/common'),
  buildAllCode('./code/client'),
  buildAllSVG(),
  buildAllSASS(),
  buildIcons(),
  buildAssets()
])
