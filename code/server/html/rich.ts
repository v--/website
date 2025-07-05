import { HTMLElement, Node, TextNode, parse } from 'node-html-parser'

import { UnsupportedHtmlError } from './errors.ts'
import { HtmlVisitor } from './visitor.ts'
import { type IRichTextDocument, type IRichTextEntry } from '../../common/rich.ts'

/**
 * Try to create a rich text document from HTML. Adjusted for TeX4ht output.
 */
export function parseHtml(string: string): IRichTextDocument {
  const parsedElement = parse(string)
  const visitor = new HtmlToRichTextVisitor()
  return visitor.visitAndEnforceDocument(parsedElement)
}

export class HtmlToRichTextVisitor extends HtmlVisitor<IRichTextEntry | IRichTextDocument> {
  getNodeText(node: Node, trim: boolean): string {
    if (trim) {
      return node.text.trim()
    }

    if (node instanceof TextNode && node.isWhitespace) {
      return ''
    }

    return node.text
  }

  visitText(node: TextNode): IRichTextEntry {
    return {
      kind: 'text',
      text: this.getNodeText(node, false),
    }
  }

  visitAndEnforceDocument(node: Node): IRichTextDocument {
    if (!(node instanceof HTMLElement)) {
      throw new UnsupportedHtmlError('Expected the top-level node to be an HTML element')
    }

    const entry = this.visitRoot(node)

    if (entry.kind !== 'document') {
      throw new UnsupportedHtmlError(`Expected the top-level element to be a document element, but got ${entry.kind}`)
    }

    return entry
  }

  visitAndEnforceEntry(node: Node): IRichTextEntry {
    const entry = this.visit(node)

    if (entry.kind === 'document') {
      throw new UnsupportedHtmlError("Unexpected child element of type 'document'")
    }

    return entry
  }

  visitBody(element: HTMLElement): IRichTextDocument {
    return {
      kind: 'document',
      entries: element.childNodes.map(c => this.visitAndEnforceEntry(c)),
    }
  }

  #isEntryImmaterial(entry: IRichTextEntry): boolean {
    switch (entry.kind) {
      case 'text':
        return entry.text === ''

      case 'anchor':
        return entry.href === undefined

      case 'mathml':
        return entry.tag === 'mtext' && entry.text === ''

      default:
        return false
    }
  }

  * #iterChildren(element: HTMLElement): Generator<IRichTextEntry> {
    for (const child of element.childNodes) {
      const entry = this.visitAndEnforceEntry(child)

      if (!this.#isEntryImmaterial(entry)) {
        yield entry
      }
    }
  }

  #collapseChildren(element: HTMLElement): IRichTextEntry[] {
    const children = Array.from(this.#iterChildren(element))

    if (children.every(c => c.kind === 'text')) {
      return [
        {
          kind: 'text',
          text: children.map(c => c.text).join('\n'),
        },
      ]
    }

    return children
  }

  #parseContent(element: HTMLElement, trim?: boolean): { children: IRichTextEntry[] } | { text: string } | undefined {
    const children = this.#collapseChildren(element)

    if (children.length === 0) {
      if (element.text !== '') {
        return { text: this.getNodeText(element, trim ?? false) }
      }

      return undefined
    }

    if (children.length === 1 && children[0].kind === 'text') {
      return { text: trim ? children[0].text.trim() : children[0].text }
    }

    return {
      children,
    }
  }

  visitSPAN = HtmlToRichTextVisitor.prototype.visitText

  visitDIV(element: HTMLElement) {
    return {
      kind: 'container',
      ...this.#parseContent(element),
    }
  }

  visitIMG(element: HTMLElement) {
    return {
      kind: 'image',
      href: element.getAttribute('src'),
      ...this.#parseContent(element),
    }
  }

  visitHeading(element: HTMLElement) {
    return {
      kind: 'heading',
      level: Number(element.tagName.slice(1)),
      ...this.#parseContent(element),
    }
  }

  visitH1 = HtmlToRichTextVisitor.prototype.visitHeading
  visitH2 = HtmlToRichTextVisitor.prototype.visitHeading
  visitH3 = HtmlToRichTextVisitor.prototype.visitHeading
  visitH4 = HtmlToRichTextVisitor.prototype.visitHeading
  visitH5 = HtmlToRichTextVisitor.prototype.visitHeading
  visitH6 = HtmlToRichTextVisitor.prototype.visitHeading

  visitP(element: HTMLElement) {
    return {
      kind: 'paragraph',
      ...this.#parseContent(element),
    }
  }

  visitEM(element: HTMLElement) {
    return {
      kind: 'emph',
      ...this.#parseContent(element),
    }
  }

  visitSTRONG(element: HTMLElement) {
    return {
      kind: 'strong',
      ...this.#parseContent(element),
    }
  }

  visitUL(element: HTMLElement) {
    const children = Array.from(this.#iterChildren(element))

    return {
      kind: 'list',
      ordered: false,
      // We oblige the children to be list items, but TypeScript doesn't know that
      tight: children.every(c => c.kind === 'list_item' && c.children.length === 1),
      items: this.#collapseChildren(element),
    }
  }

  visitLI(element: HTMLElement) {
    return {
      kind: 'list_item',
      children: this.#collapseChildren(element).map(c => c.kind === 'paragraph' ? c : { kind: 'paragraph', children: c }),
    }
  }

  visitA(element: HTMLElement) {
    const href = element.getAttribute('href')

    return {
      kind: 'anchor',
      ...this.#parseContent(element),
      href,
    }
  }

  visitTABLE(element: HTMLElement) {
    return {
      kind: 'table',
      rows: this.#collapseChildren(element),
    }
  }

  visitTR(element: HTMLElement) {
    return {
      kind: 'table_row',
      cells: this.#collapseChildren(element),
    }
  }

  visitTD(element: HTMLElement) {
    return {
      kind: 'table_cell',
      ...this.#parseContent(element),
    }
  }

  visitMATH(element: HTMLElement) {
    const attributes = { ...element.attributes }
    delete attributes.xmlns

    return {
      kind: 'mathml',
      tag: element.tagName.toLowerCase(),
      attributes,
      ...this.#parseContent(element, true),
    }
  }

  visitMFRAC = HtmlToRichTextVisitor.prototype.visitMATH
  visitMI = HtmlToRichTextVisitor.prototype.visitMATH
  visitMN = HtmlToRichTextVisitor.prototype.visitMATH
  visitMO = HtmlToRichTextVisitor.prototype.visitMATH
  visitMROW = HtmlToRichTextVisitor.prototype.visitMATH
  visitMSQRT = HtmlToRichTextVisitor.prototype.visitMATH
  visitMSTYLE = HtmlToRichTextVisitor.prototype.visitMATH
  visitMSUBSUP = HtmlToRichTextVisitor.prototype.visitMATH
  visitMSUP = HtmlToRichTextVisitor.prototype.visitMATH
  visitMTEXT = HtmlToRichTextVisitor.prototype.visitMATH
  visitMUNDEROVER = HtmlToRichTextVisitor.prototype.visitMATH

  override visitHtmlElement(element: HTMLElement): IRichTextEntry {
    throw new UnsupportedHtmlError(`Unsupported HTML element type ${element.tagName}`)
  }
}
