import { CoolError } from '../../errors.mjs'
import { repr } from '../strings.mjs'
import { c } from '../../rendering/component.mjs'
import NodeType from './node_type.mjs'

import link from '../../components/link.mjs'

export class MarkdownComponentError extends CoolError {}

export function buildComponentTree (ast) {
  switch (ast.type) {
    case NodeType.CONTAINER:
      return c('div', null, ...ast.children.map(buildComponentTree))

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
      return c('pre', null,
        c('code', { text: ast.code })
      )

    case NodeType.EMPHASIS:
      return c('em', null, buildComponentTree(ast.node))

    case NodeType.STRONG_EMPHASIS:
      return c('b', null, buildComponentTree(ast.node))

    case NodeType.HEADING:
      return c('h' + ast.level, null, buildComponentTree(ast.node))

    case NodeType.BULLET_LIST:
      return c(ast.ordered ? 'ol' : 'ul', null, ...ast.bullets.map(function (node) {
        if (node.type === NodeType.BULLET_LIST) {
          return buildComponentTree(node)
        } else {
          return c('li', null, buildComponentTree(node))
        }
      }))

    default:
      throw new MarkdownComponentError('Unknown token type ' + repr(ast.type))
  }
}
