import { enumerate } from '../enumerate.js'

export const TokenType = enumerate(
  'WHITESPACE',
  'LINE_BREAK',
  'ANCHOR_NODE',
  'ANCHOR_LINK',
  'ANCHOR',
  'CODE_BLOCK',
  'CODE',
  'EMPHASIS',
  'STRONG_EMPHASIS',
  'HEADING',
  'BULLET',
  'BULLET_LIST',
  'MARKDOWN'
)
