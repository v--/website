import { CoolError } from '../../errors'
import { repr } from '../strings.js'
import { c, Component } from '../../rendering/component.js'

import { anchor } from '../../components/anchor.js'

export class MarkdownComponentError extends CoolError {}

/**
 * @param {TMarkdown.MarkdownNode} ast
 * @returns {Component}
 */
export function buildComponentTree(ast) {
  switch (ast.type) {
    case 'container':
      return c('span', undefined, ...ast.children.map(buildComponentTree))

    case 'lineBreak':
      // br was not good enough
      return c('div', { class: 'line-break' })

    case 'text':
      return c('span', { text: ast.text })

    case 'anchor':
      if (ast.node.type === 'text') {
        return c(anchor, { href: ast.href, text: ast.node.text })
      }

      return c(anchor, { href: ast.href }, buildComponentTree(ast.node))

    case 'code':
      return c('code', { text: ast.code })

    case 'codeBlock':
      return c('pre', undefined,
        c('code', { text: ast.code })
      )

    case 'emphasis':
      return c('em', undefined, buildComponentTree(ast.node))

    case 'strongEmphasis':
      return c('b', undefined, buildComponentTree(ast.node))

    case 'veryStrongEmphasis':
      return c('em', undefined,
        c('b', undefined, buildComponentTree(ast.node))
      )

    case 'heading':
      return c('h' + ast.level, { class: 'h' + ast.level }, buildComponentTree(ast.node))

    case 'bulletList':
      return c(ast.ordered ? 'ol' : 'ul', { class: 'cool-list' }, ...ast.bullets.map(function(bullet) {
        switch (bullet.type) {
          case 'bulletList':
            return buildComponentTree(bullet)

          case 'bulletUnordered':
            return c('li', undefined, buildComponentTree(bullet.node))

          case 'bulletOrdered':
            return c('li', { value: String(bullet.order) }, buildComponentTree(bullet.node))
        }
      }))

    default:
      throw new MarkdownComponentError('Unknown token type ' + repr(ast.type))
  }
}
