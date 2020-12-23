import { CoolError } from '../../errors.js'
import { repr } from '../strings.js'
import { c, Component } from '../../rendering/component.js'
import { MarkdownNode, NodeType } from './node_type.js'

import { link } from '../../components/link.js'

export class MarkdownComponentError extends CoolError {}

export function buildComponentTree(ast: MarkdownNode): Component {
  switch (ast.type) {
    case NodeType.CONTAINER:
      return c('div', undefined, ...ast.children.map(buildComponentTree))

    case NodeType.LINE_BREAK:
      // br was not good enough
      return c('div', { class: 'line-break' })

    case NodeType.TEXT:
      return c('span', { text: ast.text })

    case NodeType.ANCHOR:
      if (ast.node.type === NodeType.TEXT) {
        return c(link, { link: ast.link, text: ast.node.text })
      }

      return c(link, { link: ast.link }, buildComponentTree(ast.node))

    case NodeType.CODE:
      return c('code', { text: ast.code })

    case NodeType.CODE_BLOCK:
      return c('pre', undefined,
        c('code', { text: ast.code })
      )

    case NodeType.EMPHASIS:
      return c('em', undefined, buildComponentTree(ast.node))

    case NodeType.STRONG_EMPHASIS:
      return c('b', undefined, buildComponentTree(ast.node))

    case NodeType.VERY_STRONG_EMPHASIS:
      return c('em', undefined,
        c('b', undefined, buildComponentTree(ast.node))
      )

    case NodeType.HEADING:
      return c('h' + ast.level, { class: 'h' + ast.level }, buildComponentTree(ast.node))

    case NodeType.BULLET_LIST:
      return c(ast.ordered ? 'ol' : 'ul', { class: 'cool-list' }, ...ast.bullets.map(function(bullet) {
        switch (bullet.type) {
          case NodeType.BULLET_LIST:
            return buildComponentTree(bullet)

          case NodeType.BULLET_UNORDERED:
            return c('li', undefined, buildComponentTree(bullet.node))

          case NodeType.BULLET_ORDERED:
            return c('li', { value: String(bullet.order) }, buildComponentTree(bullet.node))
        }
      }))

    default:
      throw new MarkdownComponentError('Unknown token type ' + repr(ast.type))
  }
}
