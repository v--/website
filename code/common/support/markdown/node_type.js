import { enumerate } from '../enumerate.js'

export const NodeType = enumerate(
  'CONTAINER',
  'LINE_BREAK',
  'TEXT',
  'ANCHOR',
  'CODE_BLOCK',
  'CODE',
  'EMPHASIS',
  'STRONG_EMPHASIS',
  'HEADING',
  'BULLET_LIST'
)
