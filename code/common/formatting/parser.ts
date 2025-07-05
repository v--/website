import { FormattingTemplateParserContext } from './parser_context.ts'
import { tokenizeFormattingTemplate } from './tokenizer.ts'
import { type FormattingTemplateToken, type FormattingTemplateTokenKind } from './tokens.ts'
import { type IFieldFormattingTemplateEntry, type IFormattingTemplate, type IFormattingTemplateEntry } from './types.ts'
import { Parser } from '../parsing/parser.ts'

export class FormattingTemplateParser extends Parser<FormattingTemplateTokenKind, FormattingTemplateToken> {
  #parseText(context: FormattingTemplateParserContext): string {
    let head = this.peek()
    let isParsingText = true

    while (head && isParsingText) {
      switch (head.kind) {
        case 'STRING':
        case 'OPENING_BRACE':
        case 'CLOSING_BRACE':
          head = this.advanceAndPeek()
          break

        case 'DOLLAR':
          isParsingText = false
      }
    }

    context.closeAtPreviousToken()
    return context.getContextString()
  }

  #parseField(context: FormattingTemplateParserContext): IFieldFormattingTemplateEntry {
    this.advance()
    let head = this.peek()

    if (head?.kind !== 'OPENING_BRACE') {
      throw context.annotateContextError('Field specifier must start with ${')
    }

    head = this.advanceAndPeek()

    if (head?.kind === 'CLOSING_BRACE') {
      throw context.annotateContextError('Empty field specifier')
    }

    while (head) {
      switch (head.kind) {
        case 'CLOSING_BRACE': {
          context.closeAtPreviousToken()
          this.advance()

          return {
            field: context.getContextString().slice(2),
          }
        }

        case 'DOLLAR':
          throw context.annotateContextError('Cannot have nested field specifiers')

        case 'OPENING_BRACE':
          throw context.annotateContextError('Cannot have unescaped opening braces inside field specifiers')

        case 'STRING':
          break
      }

      this.advance()
      head = this.peek()
    }

    throw context.annotateContextError('Field specifier ended abruptly')
  }

  #parseEntry(context: FormattingTemplateParserContext): IFormattingTemplateEntry {
    switch (this.peek()!.kind) {
      case 'STRING':
      case 'OPENING_BRACE':
      case 'CLOSING_BRACE':
        return this.#parseText(context)

      case 'DOLLAR':
        return this.#parseField(context)
    }
  }

  parse(): IFormattingTemplate {
    const entries: IFormattingTemplateEntry[] = []

    if (this.peek() === undefined) {
      return { entries }
    }

    const context = new FormattingTemplateParserContext(this)

    while (this.peek()) {
      context.reset()
      const entry = this.#parseEntry(context)
      entries.push(entry)
    }

    return { entries }
  }
}

export function parseFormattingTemplate(source: string): IFormattingTemplate {
  const tokens = tokenizeFormattingTemplate(source)
  const parser = new FormattingTemplateParser(source, tokens)
  const result = parser.parse()
  parser.assertExhausted()
  return result
}
