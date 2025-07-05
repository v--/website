import { type IToken } from '../parsing/tokens.ts'
import { type uint32 } from '../types/numbers.ts'

export const TOKEN_KIND_LIST = [
  // Value-dependent
  'STRING',

  // Singletons
  'DOLLAR',
  'OPENING_BRACE',
  'CLOSING_BRACE',
] as const

export type FormattingTemplateTokenKind = typeof TOKEN_KIND_LIST[uint32]

export const SINGLETON_TOKEN_MAP: Record<string, FormattingTemplateTokenKind> = {
  ['$']: 'DOLLAR',
  ['{']: 'OPENING_BRACE',
  ['}']: 'CLOSING_BRACE',
}

export type FormattingTemplateToken = IToken<FormattingTemplateTokenKind>
