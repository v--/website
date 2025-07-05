import { type MarkdownToken, type MarkdownTokenKind, SINGLETON_TOKEN_MAP } from './tokens.ts'
import { Tokenizer } from '../parsing/tokenizer.ts'
import { type TokenizerContext } from '../parsing/tokenizer_context.ts'
import { type IToken } from '../parsing/tokens.ts'

export class MarkdownTokenizer extends Tokenizer<MarkdownTokenKind> {
  override readToken(context: TokenizerContext<MarkdownTokenKind>): IToken<MarkdownTokenKind> | undefined {
    let head = this.peek()

    if (head && head in SINGLETON_TOKEN_MAP) {
      this.advance()
      context.closeAtPreviousChar()
      return context.extractToken(SINGLETON_TOKEN_MAP[head])
    }

    while (head && !(head in SINGLETON_TOKEN_MAP)) {
      this.advance()
      head = this.peek()
    }

    if (!context.isEmpty()) {
      context.closeAtPreviousChar()
      return context.extractToken('STRING')
    }
  }
}

export function tokenizeMarkdown(source: string): MarkdownToken[] {
  const tokenizer = new MarkdownTokenizer(source)
  const result = Array.from(tokenizer.iterTokens())
  tokenizer.assertExhausted()
  return result
}
