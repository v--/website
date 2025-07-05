/**
 * Port of https://github.com/v--/notebook/blob/master/code/notebook/parsing/tokenizer_context.py
 */

import { TokenizerError } from './errors.ts'
import { ErrorHighlighter } from './highlighter.ts'
import { type Tokenizer } from './tokenizer.ts'
import { type IToken } from './tokens.ts'
import { type uint32 } from '../types/numbers.ts'

export class TokenizerContext<TokenKindT> {
  tokenizer: Tokenizer<TokenKindT>
  offsetStart: uint32
  offsetEnd?: uint32

  constructor(tokenizer: Tokenizer<TokenKindT>) {
    this.tokenizer = tokenizer
    this.offsetStart = this.tokenizer.offset
    this.offsetEnd = undefined
  }

  reset() {
    this.offsetStart = this.tokenizer.offset
    this.offsetEnd = undefined

    if (this.offsetStart >= this.tokenizer.source.length) {
      throw new TokenizerError('Context can be entered before end of input')
    }
  }

  isClosed(): boolean {
    return this.offsetEnd !== undefined
  }

  closeAtCurrentChar() {
    this.offsetEnd = this.tokenizer.offset

    if (this.offsetEnd >= this.tokenizer.source.length) {
      throw new TokenizerError('Context must be closed before end of input')
    }
  }

  closeAtPreviousChar() {
    this.offsetEnd = this.tokenizer.offset - 1

    if (this.offsetEnd >= this.tokenizer.source.length) {
      throw new TokenizerError('Context must be closed before end of input')
    }
  }

  getOffsetEndSafe(): uint32 {
    if (this.offsetEnd === undefined) {
      return this.tokenizer.getSafeOffset()
    }

    return this.offsetEnd
  }

  isEmpty(): boolean {
    return this.tokenizer.offset == this.offsetStart
  }

  getContextString(): string {
    return this.tokenizer.source.slice(this.offsetStart, this.getOffsetEndSafe() + 1)
  }

  extractToken(tokenKind: TokenKindT): IToken<TokenKindT> {
    return {
      kind: tokenKind,
      offset: this.offsetStart,
      value: this.getContextString(),
    }
  }

  annotateCharError(message: string, offset?: uint32): TokenizerError {
    if (offset === undefined) {
      offset = this.getOffsetEndSafe()
    }

    const highlighter = new ErrorHighlighter({
      source: this.tokenizer.source,
      offsetHiStart: offset,
      offsetHiEnd: offset,
      offsetShownStart: this.offsetStart,
      offsetShownEnd: this.getOffsetEndSafe(),
    })

    return new TokenizerError(message, highlighter.highlight())
  }

  annotateContextError(message: string): TokenizerError {
    const highlighter = new ErrorHighlighter({
      source: this.tokenizer.source,
      offsetHiStart: this.offsetStart,
      offsetHiEnd: this.getOffsetEndSafe(),
    })

    return new TokenizerError(message, highlighter.highlight())
  }
}
