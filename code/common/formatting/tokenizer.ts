import { type FormattingTemplateToken, type FormattingTemplateTokenKind, SINGLETON_TOKEN_MAP } from './tokens.ts'
import { Tokenizer } from '../parsing/tokenizer.ts'
import { type TokenizerContext } from '../parsing/tokenizer_context.ts'

class FormattingTemplateTokenizer extends Tokenizer<FormattingTemplateTokenKind> {
  override readToken(context: TokenizerContext<FormattingTemplateTokenKind>): FormattingTemplateToken | undefined {
    let head = this.peek()

    if (head === '\\') {
      this.advance()
      head = this.peek()

      if (head === undefined) {
        throw context.annotateContextError('Escape sequence ended abruptly')
      }

      if (head in SINGLETON_TOKEN_MAP || head === '\\') {
        context.reset()
        this.advance()
        context.closeAtPreviousChar()
        return context.extractToken('STRING')
      } else {
        throw context.annotateContextError('Unrecognized escape sequence')
      }
    }

    if (head && head in SINGLETON_TOKEN_MAP) {
      this.advance()
      context.closeAtPreviousChar()
      return context.extractToken(SINGLETON_TOKEN_MAP[head])
    }

    while (head && head !== '\\' && !(head in SINGLETON_TOKEN_MAP)) {
      this.advance()
      head = this.peek()
    }

    if (!context.isEmpty()) {
      context.closeAtPreviousChar()
      return context.extractToken('STRING')
    }
  }
}

export function tokenizeFormattingTemplate(source: string): FormattingTemplateToken[] {
  const tokenizer = new FormattingTemplateTokenizer(source)
  const result = Array.from(tokenizer.iterTokens())
  tokenizer.assertExhausted()
  return result
}
