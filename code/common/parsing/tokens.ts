import { type uint32 } from '../types/numbers.ts'

export interface IToken<TokenKindT> {
  kind: TokenKindT
  value: string
  offset: uint32
}

export function getTokenEndOffset<TokenKindT>(token: IToken<TokenKindT>) {
  return token.offset + token.value.length
}
