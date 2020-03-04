import { enumerate } from '../enumerate.js'

export const TokenType = enumerate(
  'WHITESPACE',
  'LINE_BREAK',
  'NATURAL_NUMBER',
  'ANCHOR_NODE',
  'ANCHOR_LINK',
  'ANCHOR',
  'CODE_BLOCK',
  'CODE',
  'EMPHASIS',
  'STRONG_EMPHASIS',
  'VERY_STRONG_EMPHASIS',
  'HEADING',
  'BULLET_UNORDERED',
  'BULLET_ORDERED',
  'BULLET_LIST',
  'MARKDOWN'
)
