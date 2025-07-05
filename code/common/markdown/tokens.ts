import { type IToken } from '../parsing/tokens.ts'
import { type uint32 } from '../types/numbers.ts'

export const TOKEN_KIND_LIST = [
  // Value-dependent
  'STRING',

  // Singletons
  'BACKSLASH',
  'ASTERISK',
  'UNDERSCORE',
  'OPENING_CHEVRON',
  'CLOSING_CHEVRON',
  'OPENING_BRACKET',
  'CLOSING_BRACKET',
  'OPENING_PAREN',
  'CLOSING_PAREN',
] as const

export type MarkdownTokenKind = typeof TOKEN_KIND_LIST[uint32]

export const SINGLETON_TOKEN_MAP: Record<string, MarkdownTokenKind> = {
  ['\\']: 'BACKSLASH',
  ['*']: 'ASTERISK',
  ['_']: 'UNDERSCORE',
  ['<']: 'OPENING_CHEVRON',
  ['>']: 'CLOSING_CHEVRON',
  ['[']: 'OPENING_BRACKET',
  [']']: 'CLOSING_BRACKET',
  ['(']: 'OPENING_PAREN',
  [')']: 'CLOSING_PAREN',
}

export type MarkdownToken = IToken<MarkdownTokenKind>
