import { CoolError } from '../../errors.mjs'
import { repr } from '../strings.mjs'
import { parse } from '../parser.mjs'

import TokenType from './token_type.mjs'
import NodeType from './node_type.mjs'

import parserRules from './rules.mjs'

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
      return {
        type: NodeType.ANCHOR,
        link: unescape(joinTextBlocks(removeBounds(parseTree.matches[1].matches)), ')'),
        node: collapse(unescapeMatches(removeBounds(parseTree.matches[0].matches), ']'))
      }

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
      const escaped = parseTree.matches[parseTree.matches.length - 1]
      const collapsed = collapse(unescapeMatches(removeBounds(parseTree.matches), escaped))

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

    case TokenType.HEADING:
      const refinedMatches = []
      let level = 1

      for (let i = 1; i < parseTree.matches.length - 1; i++) {
        const match = parseTree.matches[i]

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

    case TokenType.MARKDOWN_LINE:
    case TokenType.MARKDOWN:
      return collapse(parseTree.matches)

    default:
      throw new MarkdownASTError('Unknown token type ' + repr(parseTree.type))
  }
}

export function parseMarkdown (string) {
  return buildAST(parse(parserRules, TokenType.MARKDOWN, string))
}
