import { Node, Parser } from 'commonmark'

import { UnsupportedMarkdownError } from './error.ts'
import { MarkdownVisitor } from './visitor.ts'
import { type IRichTextDocument, type IRichTextEntry } from '../../common/rich.ts'

export function parseMarkdown(string: string): IRichTextDocument {
  const reader = new Parser()
  const parsedNode = reader.parse(string)
  const visitor = new MarkdownToRichTextVisitor()
  return visitor.visitAndEnforceDocument(parsedNode)
}

export class MarkdownToRichTextVisitor extends MarkdownVisitor<IRichTextEntry | IRichTextDocument> {
  visitAndEnforceDocument(node: Node): IRichTextDocument {
    const entry = this.visit(node)

    if (entry.kind !== 'document') {
      throw new UnsupportedMarkdownError(`Expected the top-level node to be a document node, but got ${entry.kind}`)
    }

    return entry
  }

  visitAndEnforceEntry(node: Node): IRichTextEntry {
    const entry = this.visit(node)

    if (entry.kind === 'document') {
      throw new UnsupportedMarkdownError("Unexpected child node of type 'document'")
    }

    return entry
  }

  visitText(node: Node) {
    return {
      kind: 'text',
      text: node.literal,
    }
  }

  visitCode(node: Node) {
    return {
      kind: 'code',
      text: node.literal,
    }
  }

  visitCodeBlock(node: Node) {
    return {
      kind: 'code_block',
      text: node.literal,
    }
  }

  * #iterChildren(node: Node): Generator<IRichTextEntry> {
    let child = node.firstChild

    if (child === null) {
      return
    }

    yield this.visitAndEnforceEntry(child)

    while ((child = child.next)) {
      yield this.visitAndEnforceEntry(child)
    }
  }

  #parseContent(node: Node): { children: IRichTextEntry[] } | { text: string } | undefined {
    const children = Array.from(this.#iterChildren(node))

    if (children.length === 0) {
      return undefined
    }

    if (children.every(c => c.kind === 'text' || c.kind == 'soft_break')) {
      return {
        text: children.map(
          function (child) {
            switch (child.kind) {
              case 'soft_break':
                return '\n'
              case 'text':
                return child.text
            }
          },
        ).join(''),
      }
    }

    return { children }
  }

  visitDocument(node: Node): IRichTextDocument {
    return {
      kind: 'document',
      entries: Array.from(this.#iterChildren(node)),
    }
  }

  visitParagraph(node: Node) {
    return {
      kind: 'paragraph',
      ...this.#parseContent(node),
    }
  }

  visitEmph(node: Node) {
    return {
      kind: 'emph',
      ...this.#parseContent(node),
    }
  }

  visitStrong(node: Node) {
    return {
      kind: 'strong',
      ...this.#parseContent(node),
    }
  }

  visitHeading(node: Node) {
    return {
      kind: 'heading',
      level: node.level,
      ...this.#parseContent(node),
    }
  }

  visitList(node: Node) {
    return {
      kind: 'list',
      ordered: node.listType === 'ordered',
      tight: node.listTight,
      items: Array.from(this.#iterChildren(node)),
    }
  }

  visitItem(node: Node) {
    return {
      kind: 'list_item',
      children: Array.from(this.#iterChildren(node)),
    }
  }

  visitLink(node: Node) {
    return {
      kind: 'anchor',
      ...this.#parseContent(node),
      href: decodeURI(node.destination!),
    }
  }

  visitThematicBreak(_node: Node) {
    return { kind: 'horizontal_rule' }
  }

  visitSoftbreak(_node: Node) {
    return { kind: 'soft_break' }
  }

  visitImage(node: Node) {
    return {
      kind: 'image',
      href: decodeURI(node.destination!),
      ...this.#parseContent(node),
    }
  }

  override visitGeneric(node: Node): IRichTextEntry {
    throw new UnsupportedMarkdownError(`Unsupported commonmark node type ${node.type}`)
  }
}
