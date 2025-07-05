/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import { HTMLElement, Node, TextNode } from 'node-html-parser'

import { NoHtmlBodyError, UnsupportedHtmlError } from './errors.ts'
import { snakeToPascalCase } from '../../common/support/strings.ts'

export abstract class HtmlVisitor<T> {
  visit(node: Node): T {
    switch (node.nodeType) {
      case 1: { // Element node
        const element = node as HTMLElement
        const pascalCase = snakeToPascalCase(element.tagName)
        const methodName = `visit${pascalCase}`

        if (methodName in this) {
          const method = (this as unknown as Record<string, (element: HTMLElement) => T>)[methodName]
          return method.call(this, element)
        }

        return this.visitHtmlElement(element)
      }

      case 3: // Text node
        return this.visitText(node as TextNode)

      default:
        throw new UnsupportedHtmlError(`Unexpected node type ${node.nodeType}`)
    }
  }

  visitRoot(element: HTMLElement): T {
    const body = element.querySelector('body')

    if (body === null) {
      throw new NoHtmlBodyError('Could not find an HTML body element')
    }

    return this.visitBody(body)
  }

  abstract visitText(node: TextNode): T
  abstract visitBody(element: HTMLElement): T
  abstract visitHtmlElement(element: HTMLElement): T
}
