import { type FormattingTemplateToken, type FormattingTemplateTokenKind } from './tokens.ts'
import { ParserContext } from '../parsing/parser_context.ts'

export class FormattingTemplateParserContext extends ParserContext<FormattingTemplateTokenKind, FormattingTemplateToken> {
  getContextString(): string {
    // We cannot get the context string directly because of possible escape characters
    const tokens = this.getContextTokens()
    return tokens.map(({ value }) => value).join('')
  }
}
