import { CoolError } from '../../errors.js'
import { repr } from '../strings.js'
import { parse } from '../parser.js'

import TokenType from './token_type.js'
import NodeType from './node_type.js'

import parserRules from './rules.js'

export class MarkdownASTError extends CoolError {}

function * iterCollapseNodes (nodes) {
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

function collapse (matches) {
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

function collapseAnchor (matches) {
  const link = unescape(
    joinTextBlocks(removeBounds(matches[1].matches)),
    ')'
  )

  const nodeMatches = removeBounds(matches[0].matches)
  let node

  if (nodeMatches.length === 0) {
    node = {
      type: NodeType.TEXT,
      text: link
    }
  } else {
    node = collapse(
      unescapeMatches(
        removeBounds(matches[0].matches),
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

function collapseEmphasis (matches) {
  const escaped = matches[matches.length - 1]
  const collapsed = collapse(unescapeMatches(removeBounds(matches), escaped))

  if (collapsed.type === NodeType.EMPHASIS) {
    return {
      type: NodeType.STRONG_EMPHASIS,
      node: collapsed.node
    }
  }

  return {
    type: NodeType.EMPHASIS,
    node: collapsed
  }
}

function collapseHeading (matches) {
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

function collapseBullet (matches) {
  return {
    level: matches[1].matches.length + 1,
    ordered: matches[2] === '+',
    node: collapse(
      matches.slice(matches[3] === ' ' ? 4 : 3)
    )
  }
}

function collapseBulletList (matches) {
  const flatBulletList = matches
    .slice(0, matches.length - 1)
    .map(buildAST)

  const minLevel = Math.min.apply(null, flatBulletList.map(b => b.level))
  const root = {
    type: NodeType.BULLET_LIST,
    bullets: [],
    ordered: flatBulletList[0].ordered
  }

  const rootLevels = new Map([[root, minLevel]])
  const roots = [root]

  for (const bullet of flatBulletList) {
    let currentRoot = roots[roots.length - 1]
    let currentLevel = rootLevels.get(currentRoot)

    if (bullet.level === currentLevel) {
      currentRoot.bullets.push(bullet.node)
    } else if (bullet.level > currentLevel) {
      const newRoot = {
        type: NodeType.BULLET_LIST,
        bullets: [bullet.node],
        ordered: bullet.ordered
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

      currentRoot.bullets.push(bullet.node)
    }
  }

  return root
}

function joinTextBlocks (matches) {
  let result = ''

  for (const match of matches) {
    if (typeof match !== 'string') {
      throw new MarkdownASTError('Cannot join non-strings')
    }

    result += match
  }

  return result
}

function removeBounds (matches) {
  return matches.slice(1, matches.length - 1)
}

function unescape (string, terminal) {
  return string.replace('\\' + terminal, terminal)
}

function unescapeMatches (matches, terminal) {
  return matches.map(function (match) {
    if (typeof match === 'string') {
      return unescape(match, terminal)
    }

    return {
      type: match.type,
      matches: unescapeMatches(match.matches, terminal)
    }
  })
}

export function buildAST (parseTree) {
  if (typeof parseTree === 'string') {
    return {
      type: NodeType.TEXT,
      text: parseTree
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

    case TokenType.EMPHASIS:
      return collapseEmphasis(parseTree.matches)

    case TokenType.HEADING:
      return collapseHeading(parseTree.matches)

    case TokenType.BULLET:
      return collapseBullet(parseTree.matches)

    case TokenType.BULLET_LIST:
      return collapseBulletList(parseTree.matches)

    case TokenType.MARKDOWN:
      return collapse(parseTree.matches)

    default:
      throw new MarkdownASTError('Unknown token type ' + repr(parseTree.type))
  }
}

export function parseMarkdown (string) {
  return buildAST(parse(parserRules, TokenType.MARKDOWN, string))
}
