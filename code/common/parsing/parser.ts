/**
 * Port of https://github.com/v--/notebook/blob/master/code/notebook/parsing/parser.py
 */

import { ParserError } from './errors.ts'
import { ErrorHighlighter } from './highlighter.ts'
import { type IToken, getTokenEndOffset } from './tokens.ts'
import { type uint32 } from '../types/numbers.ts'

export class Parser<TokenKindT, TokenT extends IToken<TokenKindT>> {
  source: string
  tokens: TokenT[]
  tokenIndex: uint32

  constructor(source: string, tokens: TokenT[]) {
    this.source = source
    this.tokens = tokens
    this.tokenIndex = 0
  }

  reset() {
    this.tokenIndex = 0
  }

  peek(): TokenT | undefined {
    return this.tokens[this.tokenIndex]
  }

  getSafeTokenIndex(): uint32 {
    if (this.tokens.length == 0) {
      throw new ParserError('Empty token list')
    }

    return Math.min(this.tokenIndex, this.tokens.length - 1)
  }

  annotateUnexpectedEndOfInput(): ParserError {
    if (this.source == '') {
      return new ParserError('Empty input')
    }

    return this.annotateTokenError('Unexpected end of input')
  }

  peekUnsafe(): TokenT {
    if (this.tokenIndex >= this.tokens.length) {
      throw this.annotateUnexpectedEndOfInput()
    }

    return this.tokens[this.tokenIndex]
  }

  peekSafe(): TokenT {
    return this.tokens[this.getSafeTokenIndex()]
  }

  peekMultiple(count: uint32): TokenT[] {
    return this.tokens.slice(this.tokenIndex, this.tokenIndex + count)
  }

  advance(count: uint32 = 1) {
    this.tokenIndex += count
  }

  advanceAndPeek(count: uint32 = 1): TokenT | undefined {
    this.advance(count)
    return this.peek()
  }

  annotateTokenError(message: string, token?: TokenT): ParserError {
    if (token === undefined) {
      token = this.peekSafe()
    }

    const highlighter = new ErrorHighlighter({
      source: this.source,
      offsetHiStart: token.offset,
      offsetHiEnd: getTokenEndOffset(token) - 1,
    })

    return new ParserError(message, highlighter.highlight())
  }

  assertExhausted() {
    if (this.peek()) {
      throw this.annotateTokenError('Finished parsing but there is still input left')
    }
  }
}
