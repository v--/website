import { MarkdownParserContext } from './parser_context.ts'
import { tokenizeMarkdown } from './tokenizer.ts'
import { type MarkdownToken, type MarkdownTokenKind } from './tokens.ts'
import { Parser } from '../parsing/parser.ts'
import { HtmlComponent } from '../rendering/component.ts'

export class MarkdownParser extends Parser<MarkdownTokenKind, MarkdownToken> {
  parseAnchor(): HtmlComponent {
    let head = this.peek()
    const context = new MarkdownParserContext(this)

    if (!head || head.kind !== 'OPENING_BRACKET') {
      context.closeAtPreviousToken()
      return new HtmlComponent('p', { text: context.getContextString() }, [])
    }

    head = this.advanceAndPeek()
    context.reset()

    while (head && head.kind === 'STRING') {
      head = this.advanceAndPeek()
    }

    context.closeAtPreviousToken()
    const text = context.getContextString()

    if (!head || head.kind !== 'CLOSING_BRACKET') {
      context.closeAtPreviousToken()
      return new HtmlComponent('p', { text: context.getContextString() }, [])
    }

    head = this.advanceAndPeek()

    if (!head || head.kind !== 'OPENING_PAREN') {
      context.closeAtPreviousToken()
      return new HtmlComponent('p', { text: context.getContextString() }, [])
    }

    head = this.advanceAndPeek()
    context.reset()

    while (head && head.kind !== 'CLOSING_PAREN') {
      head = this.advanceAndPeek()
    }

    context.closeAtPreviousToken()

    if (head && head.kind === 'CLOSING_PAREN') {
      this.advance()
      return new HtmlComponent('a', { text, href: context.getContextString() }, [])
    }

    context.closeAtPreviousToken()
    return new HtmlComponent('p', { text: context.getContextString() }, [])
  }

  * iterParse(): Generator<HtmlComponent> {
    let head = this.peek()

    while (head) {
      switch (head.kind) {
        case 'STRING':
          yield new HtmlComponent('p', { text: head.value }, [])
          this.advance()
          break

        case 'OPENING_BRACKET':
          yield this.parseAnchor()
          break

        default:
          yield new HtmlComponent('span', { text: head.value }, [])
          this.advance()
          break
      }

      head = this.peek()
    }
  }

  parse(): HtmlComponent {
    const children = Array.from(this.iterParse())

    if (children.length === 0) {
      return new HtmlComponent('span', undefined, [])
    }

    return children[0]
  }
}

export function parseMarkdown(source: string): HtmlComponent {
  const tokens = tokenizeMarkdown(source)
  const parser = new MarkdownParser(source, tokens)
  const result = parser.parse()
  parser.assertExhausted()
  return result
}
