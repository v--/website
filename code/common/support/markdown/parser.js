import { CoolError } from '../../errors'
import { repr } from '../strings.js'
import { parse } from '../parser.js'

import { markdownRules } from './rules.js'

export class MarkdownASTError extends CoolError {}

/**
 * @param {TMarkdown.MarkdownNode[]} nodes
 * @returns {Generator<TMarkdown.MarkdownNode>}
 */
function * iterCollapseNodes(nodes) {
  let buffer = []

  for (const child of nodes) {
    if (child.type === 'text') {
      if (child.text !== '') {
        buffer.push(child.text)
      }
    } else {
      if (buffer.length) {
        yield {
          type: 'text',
          text: buffer.join('')
        }

        buffer = []
      }

      yield child
    }
  }

  if (buffer.length) {
    yield {
      type: 'text',
      text: buffer.join('')
    }
  }
}

/**
 * @param {TParsing.ParseTree[]} matches
 * @returns {TMarkdown.MarkdownNode}
 */
function collapse(matches) {
  const children = matches.map(buildAST)
  const collapsed = Array.from(iterCollapseNodes(children))

  if (collapsed.length === 1) {
    return collapsed[0]
  }

  return {
    type: 'container',
    children: collapsed
  }
}

/**
 * @param {TParsing.ParseTree[]} matches
 * @returns {TMarkdown.MarkdownNode}
 */
function collapseAnchor(matches) {
  const anchorNode = /** @type {TParsing.IParseTree} */ (matches[0])
  const anchorHref = /** @type {TParsing.IParseTree} */ (matches[1])

  const href = unescape(
    joinTextBlocks(removeBounds(anchorHref.matches)),
    ')'
  )

  const nodeMatches = removeBounds(anchorNode.matches)

  /** @type {TMarkdown.MarkdownNode} */
  let node

  if (nodeMatches.length === 0) {
    node = {
      type: 'text',
      text: href
    }
  } else {
    node = collapse(
      unescapeMatches(
        removeBounds(anchorNode.matches),
        ']'
      )
    )
  }

  return {
    type: 'anchor',
    href,
    node
  }
}

/**
 * @param {TParsing.ParseTree[]} matches
 * @returns {TMarkdown.IHeadingNode}
 */
function collapseHeading(matches) {
  const refinedMatches = []
  let level = 1

  for (let i = 1; i < matches.length - 1; i++) {
    const match = matches[i]

    if (i === level && match === '#') {
      level++
    } else if (i !== level || match !== ' ') {
      refinedMatches.push(match)
    }
  }

  return {
    type: 'heading',
    level,
    node: collapse(refinedMatches)
  }
}

/**
 * @param {TParsing.ParseTree[]} matches
 * @returns {TMarkdown.IUnorderedBulletNode}
 */
function collapseUnorderedBullet(matches) {
  return {
    type: 'bulletUnordered',
    level: (/** @type {TParsing.IParseTree} */ (matches[1])).matches.length + 1,
    node: collapse(
      matches.slice(matches[3] === ' ' ? 4 : 3)
    )
  }
}

/**
 * @param {TParsing.ParseTree[]} matches
 * @returns {TMarkdown.IOrderedBulletNode}
 */
function collapseOrderedBullet(matches) {
  return {
    type: 'bulletOrdered',
    order: parseInt(((/** @type {TParsing.IParseTree} */ (matches[2]))).matches.join(''), 10),
    level: (/** @type {TParsing.IParseTree} */ (matches[1])).matches.length + 1,
    node: collapse(
      matches.slice(matches[4] === ' ' ? 5 : 4)
    )
  }
}

/**
 * @param {TParsing.ParseTree[]} matches
 * @returns {TMarkdown.IBulletListNode}
 */
function collapseBulletList(matches) {
  const flatBulletList = /** @type {Array<TMarkdown.IOrderedBulletNode | TMarkdown.IUnorderedBulletNode>} */ (matches
    .slice(0, matches.length - 1)
    // TypeScript 4.2 won't let me create a sum type of arrays --ivasilev@2020-12-17
    .map(buildAST))

  const minLevel = Math.min(...flatBulletList.map(b => b.level))

  /** @type {TMarkdown.IBulletListNode} */
  const root = {
    type: 'bulletList',
    bullets: [],
    ordered: flatBulletList[0].type === 'bulletOrdered'
  }

  const rootLevels = /** @type {TCons.NonStrictMap<TMarkdown.MarkdownNode, TNum.UInt32>} */ (
    new Map([[root, minLevel]])
  )

  const roots = [root]

  for (const bullet of flatBulletList) {
    let currentRoot = roots[roots.length - 1]
    let currentLevel = rootLevels.get(currentRoot)

    if (bullet.level === currentLevel) {
      currentRoot.bullets.push(bullet)
    } else if (bullet.level > currentLevel) {
      /** @type {TMarkdown.IBulletListNode} */
      const newRoot = {
        type: 'bulletList',
        bullets: [bullet],
        ordered: bullet.type === 'bulletOrdered'
      }

      rootLevels.set(newRoot, bullet.level)
      currentRoot.bullets.push(newRoot)
      roots.push(newRoot)
    } else {
      while (bullet.level < currentLevel) {
        roots.pop()
        currentRoot = roots[roots.length - 1]
        currentLevel = rootLevels.get(currentRoot)
      }

      currentRoot.bullets.push(bullet)
    }
  }

  return root
}

/**
 * @param {TParsing.ParseTree[]} matches
 * @returns {string}
 */
function joinTextBlocks(matches) {
  let result = ''

  for (const match of matches) {
    if (typeof match !== 'string') {
      throw new MarkdownASTError('Cannot join non-strings')
    }

    result += match
  }

  return result
}

/**
 * @param {TParsing.ParseTree[]} matches
 * @returns {TParsing.ParseTree[]}
 */
function removeBounds(matches) {
  return matches.slice(1, matches.length - 1)
}

/**
 * @param {string} string
 * @param {string} terminal
 * @returns {string}
 */
function unescape(string, terminal) {
  return string.replace('\\' + terminal, terminal)
}

/**
 * @param {TParsing.ParseTree[]} matches
 * @param {string} terminal
 * @returns {TParsing.ParseTree[]}
 */
function unescapeMatches(matches, terminal) {
  return matches.map(function(match) {
    if (typeof match === 'string') {
      return unescape(match, terminal)
    }

    return {
      type: match.type,
      matches: unescapeMatches(match.matches, terminal)
    }
  })
}

/**
 * @param {TParsing.ParseTree} parseTree
 * @returns {TMarkdown.MarkdownNode}
 */
export function buildAST(parseTree) {
  if (typeof parseTree === 'string') {
    return {
      type: 'text',
      text: unescape(parseTree, '_')
    }
  }

  switch (parseTree.type) {
    case 'lineBreak':
      return {
        type: 'lineBreak'
      }

    case 'anchorNode':
      return collapse(parseTree.matches)

    case 'anchorHref':
      return {
        type: 'text',
        text: joinTextBlocks(parseTree.matches)
      }

    case 'anchor':
      return collapseAnchor(parseTree.matches)

    case 'code':
      return {
        type: 'code',
        code: unescape(joinTextBlocks(removeBounds(parseTree.matches)), '`')
      }

    case 'codeBlock':
      return {
        type: 'codeBlock',
        code: unescape(joinTextBlocks(removeBounds(parseTree.matches)), '`')
      }

    case 'veryStrongEmphasis':
      return {
        type: 'veryStrongEmphasis',
        node: collapse(unescapeMatches(removeBounds(parseTree.matches), /** @type {string} */ (parseTree.matches[0])))
      }

    case 'strongEmphasis':
      return {
        type: 'strongEmphasis',
        node: collapse(unescapeMatches(removeBounds(parseTree.matches), /** @type {string} */ (parseTree.matches[0])))
      }

    case 'emphasis':
      return {
        type: 'emphasis',
        node: collapse(unescapeMatches(removeBounds(parseTree.matches), /** @type {string} */ (parseTree.matches[0])))
      }

    case 'heading':
      return collapseHeading(parseTree.matches)

    case 'bulletUnordered':
      return collapseUnorderedBullet(parseTree.matches)

    case 'bulletOrdered':
      return collapseOrderedBullet(parseTree.matches)

    case 'bulletList':
      return collapseBulletList(parseTree.matches)

    case 'markdown':
      return collapse(parseTree.matches)

    default:
      throw new MarkdownASTError('Unknown token type ' + repr(parseTree.type))
  }
}

/**
 * @param {string} string
 * @returns {TMarkdown.MarkdownNode}
 */
export function parseMarkdown(string) {
  return buildAST(parse(markdownRules, 'markdown', string))
}
