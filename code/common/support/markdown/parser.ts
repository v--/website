import { CoolError } from '../../errors.js'
import { repr } from '../strings.js'
import { ParseTree, parse, IParseTree } from '../parser.js'

import { TokenType } from './token_type.js'
import { NodeType, IBulletListNode, IHeadingNode, IOrderedBulletNode, IUnorderedBulletNode, MarkdownNode } from './node_type.js'

import { markdownRules } from './rules.js'

export class MarkdownASTError extends CoolError {}

function * iterCollapseNodes(nodes: MarkdownNode[]): Generator<MarkdownNode> {
  let buffer = []

  for (const child of nodes) {
    if (child.type === NodeType.TEXT) {
      if (child.text !== '') {
        buffer.push(child.text)
      }
    } else {
      if (buffer.length) {
        yield {
          type: NodeType.TEXT,
          text: buffer.join('')
        }

        buffer = []
      }

      yield child
    }
  }

  if (buffer.length) {
    yield {
      type: NodeType.TEXT,
      text: buffer.join('')
    }
  }
}

function collapse(matches: ParseTree[]): MarkdownNode {
  const children = matches.map(buildAST)
  const collapsed = Array.from(iterCollapseNodes(children))

  if (collapsed.length === 1) {
    return collapsed[0]
  }

  return {
    type: NodeType.CONTAINER,
    children: collapsed
  }
}

function collapseAnchor(matches: ParseTree[]): MarkdownNode {
  const anchorNode = matches[0] as IParseTree
  const anchorLink = matches[1] as IParseTree

  const link = unescape(
    joinTextBlocks(removeBounds(anchorLink.matches)),
    ')'
  )

  const nodeMatches = removeBounds(anchorNode.matches)
  let node: MarkdownNode

  if (nodeMatches.length === 0) {
    node = {
      type: NodeType.TEXT,
      text: link
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
    type: NodeType.ANCHOR,
    link,
    node
  }
}

function collapseHeading(matches: ParseTree[]): IHeadingNode {
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
    type: NodeType.HEADING,
    level,
    node: collapse(refinedMatches)
  }
}

function collapseUnorderedBullet(matches: ParseTree[]): IUnorderedBulletNode {
  return {
    type: NodeType.BULLET_UNORDERED,
    level: (matches[1] as IParseTree).matches.length + 1,
    node: collapse(
      matches.slice(matches[3] === ' ' ? 4 : 3)
    )
  }
}

function collapseOrderedBullet(matches: ParseTree[]): IOrderedBulletNode {
  return {
    type: NodeType.BULLET_ORDERED,
    order: parseInt((matches[2] as IParseTree).matches.join(''), 10),
    level: (matches[1] as IParseTree).matches.length + 1,
    node: collapse(
      matches.slice(matches[4] === ' ' ? 5 : 4)
    )
  }
}

function collapseBulletList(matches: ParseTree[]): IBulletListNode {
  const flatBulletList = matches
    .slice(0, matches.length - 1)
    // TypeScript 4.2 won't let me create a sum type of arrays --ivasilev@2020-12-17
    .map(buildAST) as Array<IOrderedBulletNode | IUnorderedBulletNode>

  const minLevel = Math.min(...flatBulletList.map(b => b.level))
  const root: IBulletListNode = {
    type: NodeType.BULLET_LIST,
    bullets: [],
    ordered: flatBulletList[0].type === NodeType.BULLET_ORDERED
  }

  const rootLevels = new Map([[root, minLevel]])
  const roots = [root]

  for (const bullet of flatBulletList) {
    let currentRoot = roots[roots.length - 1]
    let currentLevel = rootLevels.get(currentRoot)!

    if (bullet.level === currentLevel) {
      currentRoot.bullets.push(bullet)
    } else if (bullet.level > currentLevel) {
      const newRoot: IBulletListNode = {
        type: NodeType.BULLET_LIST,
        bullets: [bullet],
        ordered: bullet.type === NodeType.BULLET_ORDERED
      }

      rootLevels.set(newRoot, bullet.level)
      currentRoot.bullets.push(newRoot)
      roots.push(newRoot)
    } else {
      while (bullet.level < currentLevel) {
        roots.pop()
        currentRoot = roots[roots.length - 1]
        currentLevel = rootLevels.get(currentRoot)!
      }

      currentRoot.bullets.push(bullet)
    }
  }

  return root
}

function joinTextBlocks(matches: ParseTree[]): string {
  let result = ''

  for (const match of matches) {
    if (typeof match !== 'string') {
      throw new MarkdownASTError('Cannot join non-strings')
    }

    result += match
  }

  return result
}

function removeBounds(matches: ParseTree[]) {
  return matches.slice(1, matches.length - 1)
}

function unescape(string: string, terminal: string) {
  return string.replace('\\' + terminal, terminal)
}

function unescapeMatches(matches: ParseTree[], terminal: string): ParseTree[] {
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

export function buildAST(parseTree: ParseTree): MarkdownNode {
  if (typeof parseTree === 'string') {
    return {
      type: NodeType.TEXT,
      text: unescape(parseTree, '_')
    }
  }

  switch (parseTree.type) {
    case TokenType.LINE_BREAK:
      return {
        type: NodeType.LINE_BREAK
      }

    case TokenType.ANCHOR_NODE:
      return collapse(parseTree.matches)

    case TokenType.ANCHOR_LINK:
      return {
        type: NodeType.TEXT,
        text: joinTextBlocks(parseTree.matches)
      }

    case TokenType.ANCHOR:
      return collapseAnchor(parseTree.matches)

    case TokenType.CODE:
      return {
        type: NodeType.CODE,
        code: unescape(joinTextBlocks(removeBounds(parseTree.matches)), '`')
      }

    case TokenType.CODE_BLOCK:
      return {
        type: NodeType.CODE_BLOCK,
        code: unescape(joinTextBlocks(removeBounds(parseTree.matches)), '`')
      }

    case TokenType.VERY_STRONG_EMPHASIS:
      return {
        type: NodeType.VERY_STRONG_EMPHASIS,
        node: collapse(unescapeMatches(removeBounds(parseTree.matches), parseTree.matches[0] as string))
      }

    case TokenType.STRONG_EMPHASIS:
      return {
        type: NodeType.STRONG_EMPHASIS,
        node: collapse(unescapeMatches(removeBounds(parseTree.matches), parseTree.matches[0] as string))
      }

    case TokenType.EMPHASIS:
      return {
        type: NodeType.EMPHASIS,
        node: collapse(unescapeMatches(removeBounds(parseTree.matches), parseTree.matches[0] as string))
      }

    case TokenType.HEADING:
      return collapseHeading(parseTree.matches)

    case TokenType.BULLET_UNORDERED:
      return collapseUnorderedBullet(parseTree.matches)

    case TokenType.BULLET_ORDERED:
      return collapseOrderedBullet(parseTree.matches)

    case TokenType.BULLET_LIST:
      return collapseBulletList(parseTree.matches)

    case TokenType.MARKDOWN:
      return collapse(parseTree.matches)

    default:
      throw new MarkdownASTError('Unknown token type ' + repr(parseTree.type))
  }
}

export function parseMarkdown(string: string) {
  return buildAST(parse(markdownRules, TokenType.MARKDOWN, string))
}
