/**
 * Port of https://github.com/v--/notebook/blob/master/code/notebook/parsing/tokenizer.py
 */

import { TokenizerError } from './errors.ts'
import { ErrorHighlighter } from './highlighter.ts'
import { TokenizerContext } from './tokenizer_context.ts'
import { type IToken } from './tokens.ts'
import { type uint32 } from '../types/numbers.ts'

export abstract class Tokenizer<TokenKindT> {
  source: string
  offset: uint32

  constructor(source: string) {
    this.source = source
    this.offset = 0
  }

  reset() {
    this.offset = 0
  }

  getSafeOffset(): uint32 {
    if (this.source.length == 0) {
      throw new TokenizerError('Empty source')
    }

    return Math.min(this.offset, this.source.length - 1)
  }

  peek(): string | undefined {
    return this.source[this.offset]
  }

  peekMultiple(count: uint32): string {
    return this.source.slice(this.offset, this.offset + count)
  }

  advance(count: uint32 = 1) {
    this.offset += count
  }

  annotateCharError(message: string, offset?: uint32): TokenizerError {
    if (offset === undefined) {
      offset = this.getSafeOffset()
    }

    const highlighter = new ErrorHighlighter({
      source: this.source,
      offsetHiStart: offset,
      offsetHiEnd: offset,
    })

    return new TokenizerError(message, highlighter.highlight())
  }

  assertExhausted() {
    if (this.peek()) {
      throw this.annotateCharError('Finished tokenizing but there is still input left')
    }
  }

  * iterTokens(): Generator<IToken<TokenKindT>> {
    if (this.source == '') {
      return
    }

    const context = new TokenizerContext<TokenKindT>(this)

    while (this.peek()) {
      context.reset()
      const token = this.readToken(context)

      if (token) {
        yield token
      }
    }
  }

  abstract readToken(context: TokenizerContext<TokenKindT>): IToken<TokenKindT> | undefined
}
