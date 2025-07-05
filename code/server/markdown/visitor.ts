import { Node } from 'commonmark'

import { snakeToPascalCase } from '../../common/support/strings.ts'

export abstract class MarkdownVisitor<T> {
  visit(node: Node): T {
    const pascalCase = snakeToPascalCase(node.type)
    const methodName = `visit${pascalCase}`

    if (methodName in this) {
      const method = (this as unknown as Record<string, (node: Node) => T>)[methodName]
      return method.call(this, node)
    }

    return this.visitGeneric(node)
  }

  abstract visitGeneric(node: Node): T
}
