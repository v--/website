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
  'VERY_STRONG_EMPHASIS',
  'HEADING',
  'BULLET_UNORDERED',
  'BULLET_ORDERED',
  'BULLET_LIST'
)
