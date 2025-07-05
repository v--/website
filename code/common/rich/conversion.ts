import { NotImplementedError } from '../errors.ts'
import { type IRichTextDocument, type IRichTextEntry } from './types.ts'
import { RichTextVisitor } from './visitor.ts'

/**
 * Make a single-paragraph rich text document from a string
 */
export function convertPlainToRich(plain: string): IRichTextDocument {
  return {
    kind: 'document',
    entries: [
      {
        kind: 'paragraph',
        text: plain,
      },
    ],
  }
}

/**
 * Produce Markdown given a rich text document
 */
export function convertRichToPlain(doc: IRichTextDocument): string {
  const visitor = new PlainTextConversionVisitor()
  return visitor.visitDocument(doc)
}

export class PlainTextConversionVisitor extends RichTextVisitor<string> {
  override genericVisit(_entry: IRichTextEntry): string {
    throw new NotImplementedError()
  }

  override visitHorizontalRuleEntry(_entry: IRichTextEntry & { kind: 'horizontal_rule' }) {
    return '---'
  }

  override visitSoftBreakEntry(_entry: IRichTextEntry & { kind: 'soft_break' }) {
    return '\n'
  }

  override visitTextEntry(entry: IRichTextEntry & { kind: 'text' }) {
    return entry.text
  }

  override visitCodeEntry(entry: IRichTextEntry & { kind: 'code' }) {
    return '`' + entry.text + '`'
  }

  override visitCodeBlockEntry(entry: IRichTextEntry & { kind: 'code_block' }) {
    return '\n' + entry.text.split('\n').map(line => '  ' + line).join('\n') + '\n'
  }

  visitContent(entry: IRichTextEntry & { children?: IRichTextEntry[], text?: string }) {
    if (entry.children) {
      return entry.children.map(c => this.visit(c)).join('')
    }

    if (entry.text !== undefined) {
      return entry.text
    }

    return ''
  }

  override visitParagraphEntry(entry: IRichTextEntry & { kind: 'paragraph' }) {
    return this.visitContent(entry)
  }

  override visitContainerEntry(entry: IRichTextEntry & { kind: 'container' }) {
    return this.visitContent(entry)
  }

  override visitStrongEntry(entry: IRichTextEntry & { kind: 'strong' }) {
    return '**' + this.visitContent(entry) + '**'
  }

  override visitEmphEntry(entry: IRichTextEntry & { kind: 'emph' }) {
    return '*' + this.visitContent(entry) + '*'
  }

  override visitHeadingEntry(entry: IRichTextEntry & { kind: 'heading' }) {
    return '#'.repeat(entry.level) + ' ' + this.visitContent(entry) + '\n'
  }

  encodeUrl(url: string) {
    return url === encodeURI(url) ? url : ('<' + url + '>')
  }

  override visitAnchorEntry(entry: IRichTextEntry & { kind: 'anchor' }) {
    return `[${this.visitContent(entry)}](${this.encodeUrl(entry.href)})`
  }

  override visitListEntry(entry: IRichTextEntry & { kind: 'list' }) {
    if (entry.ordered) {
      const prefixLength = String(entry.items.length).length + 2
      return entry.items.map((c, i) => (entry.tight || i === 0 ? '' : '\n') + `${i + 1}.`.padEnd(prefixLength) + this.visit(c) + '\n').join('')
    }

    return entry.items.map((c, i) => (entry.tight || i === 0 ? '' : '\n') + '* ' + this.visit(c) + '\n').join('')
  }

  override visitListItemEntry(entry: IRichTextEntry & { kind: 'list_item' }) {
    return this.visitContent(entry)
  }

  override visitImageEntry(entry: IRichTextEntry & { kind: 'image' }) {
    return `![${this.visitContent(entry)}](${this.encodeUrl(entry.href)})`
  }

  override visitMathMLEntry(entry: IRichTextEntry & { kind: 'mathml' }) {
    switch (entry.tag) {
      case 'math':
      case 'mrow':
        if (entry.children) {
          const result = entry.children.map((c, i) => {
            if (i === 0 && c.kind === 'mathml' && c.tag === 'mo') {
              return this.visitContent(c)
            }

            return this.visit(c)
          }).join('')

          if (entry.tag === 'math') {
            if (entry.attributes?.display === 'block') {
              return '\n$$\n' + result.split('\n').map(line => '  ' + line).join('\n') + '\n$$\n'
            }

            return '$' + result + '$'
          }

          return result
        }

        return this.visitContent(entry)

      case 'mi':
      case 'mn':
        return this.visitContent(entry)

      case 'mo':
        if (entry.attributes) {
          if ('form' in entry.attributes) {
            return this.visitContent(entry)
          }

          if (entry.attributes.separator === 'true') {
            return this.visitContent(entry) + ' '
          }
        }

        return ' ' + this.visitContent(entry) + ' '

      default:
        throw new NotImplementedError()
    }
  }

  override visitDocument(doc: IRichTextDocument): string {
    return doc.entries.map(c => this.visit(c)).join('\n')
  }
}
