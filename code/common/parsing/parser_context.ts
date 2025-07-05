/**
 * Port of https://github.com/v--/notebook/blob/master/code/notebook/parsing/parser_context.py
 */

import { ParserError } from './errors.ts'
import { ErrorHighlighter } from './highlighter.ts'
import { type Parser } from './parser.ts'
import { type IToken, getTokenEndOffset } from './tokens.ts'
import { type uint32 } from '../types/numbers.ts'

export class ParserContext<TokenKindT, TokenT extends IToken<TokenKindT>> {
  parser: Parser<TokenKindT, TokenT>
  indexStart: uint32
  indexEnd?: uint32

  constructor(parser: Parser<TokenKindT, TokenT>) {
    this.parser = parser
    this.indexStart = this.parser.tokenIndex
    this.reset()
  }

  reset() {
    this.indexStart = this.parser.tokenIndex
    this.indexEnd = undefined

    if (this.indexStart >= this.parser.tokens.length) {
      throw new ParserError('Context can be entered before end of input')
    }
  }

  isClosed(): boolean {
    return this.indexEnd !== undefined
  }

  closeAtCurrentToken() {
    this.indexEnd = this.parser.tokenIndex

    if (this.indexEnd >= this.parser.tokens.length) {
      throw new ParserError('Context must be closed before end of input')
    }
  }

  closeAtPreviousToken() {
    this.indexEnd = this.parser.tokenIndex - 1

    if (this.indexEnd >= this.parser.tokens.length) {
      throw new ParserError('Context must be closed before end of input')
    }
  }

  getIndexEndSafe(): uint32 {
    if (this.indexEnd === undefined) {
      return this.parser.getSafeTokenIndex()
    }

    return this.indexEnd
  }

  isEmpty(): boolean {
    return this.parser.tokenIndex == this.indexStart
  }

  getFirstToken(): TokenT {
    return this.parser.tokens[this.indexStart]
  }

  getLastTokenSafe(): TokenT {
    return this.parser.tokens[this.getIndexEndSafe()]
  }

  getContextTokens(): TokenT[] {
    const start = this.indexStart
    const end = this.getIndexEndSafe()
    return this.parser.tokens.slice(start, end + 1)
  }

  getContextString(): string {
    const start = this.getFirstToken()
    const end = this.getLastTokenSafe()
    return this.parser.source.slice(start.offset, getTokenEndOffset(end))
  }

  annotateTokenError(message: string, token?: TokenT): ParserError {
    if (token === undefined) {
      token = this.parser.peekSafe()
    }

    const highlighter = new ErrorHighlighter({
      source: this.parser.source,
      offsetHiStart: token.offset,
      offsetHiEnd: getTokenEndOffset(token) - 1,
      offsetShownStart: this.getFirstToken().offset,
      offsetShownEnd: getTokenEndOffset(token) - 1,
    })

    return new ParserError(message, highlighter.highlight())
  }

  annotateContextError(message: string): ParserError {
    const highlighter = new ErrorHighlighter({
      source: this.parser.source,
      offsetHiStart: this.getFirstToken().offset,
      offsetHiEnd: getTokenEndOffset(this.getLastTokenSafe()) - 1,
    })

    return new ParserError(message, highlighter.highlight())
  }
}
