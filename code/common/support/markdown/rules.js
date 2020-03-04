import { wildcard, term, neg, opt, rep, cat, alt } from '../../../common/support/parser.js'

import { TokenType } from './token_type.js'

const COMMON_RULES = [
  TokenType.CODE_BLOCK,
  TokenType.CODE,
  TokenType.VERY_STRONG_EMPHASIS,
  TokenType.STRONG_EMPHASIS,
  TokenType.EMPHASIS,
  cat(TokenType.LINE_BREAK, TokenType.HEADING)
]

const LINE_MATCHER = alt(...COMMON_RULES, TokenType.ANCHOR, neg('\n'))

function createBlockRule (start, end, matcher = alt(term('\\' + end), neg(end, '\n'))) {
  return cat(
    term(start),
    matcher,
    rep(matcher),
    term(end)
  )
}

function createNestedBlockRule (start, end, rules, matcher = alt(term('\\' + end), neg(end, '\n'))) {
  return createBlockRule(start, end, alt(...rules, TokenType.LINE_BREAK, matcher))
}

export const markdownRules = Object.freeze({
  [TokenType.WHITESPACE]: rep(term(' ')),
  [TokenType.LINE_BREAK]: cat(term('\n'), TokenType.WHITESPACE),

  [TokenType.NATURAL_NUMBER]: cat(
    term('1', '2', '3', '4', '5', '6', '7', '8', '9'),
    rep(
      term('0', '1', '2', '3', '4', '5', '6', '7', '8', '9')
    )
  ),

  [TokenType.ANCHOR_NODE]: createNestedBlockRule('[', ']', COMMON_RULES),
  [TokenType.ANCHOR_LINK]: createBlockRule('(', ')'),
  [TokenType.ANCHOR]: cat(TokenType.ANCHOR_NODE, TokenType.ANCHOR_LINK),

  [TokenType.CODE_BLOCK]: createBlockRule('```', '```', alt(term('\\`'), neg('```'))),
  [TokenType.CODE]: createBlockRule('`', '`'),

  [TokenType.VERY_STRONG_EMPHASIS]: alt(
    createBlockRule('***', '***'),
    createBlockRule('___', '___')
  ),

  [TokenType.STRONG_EMPHASIS]: alt(
    createBlockRule('**', '**'),
    createBlockRule('__', '__')
  ),

  [TokenType.EMPHASIS]: alt(
    createBlockRule('*', '*'),
    createBlockRule('_', '_')
  ),

  [TokenType.HEADING]: cat(
    term('#'),
    rep(term('#')),
    opt(term(' ')),
    LINE_MATCHER,
    rep(LINE_MATCHER),
    term('\n')
  ),

  [TokenType.BULLET_UNORDERED]: cat(
    term('\n'),
    TokenType.WHITESPACE,
    term('+', '*'),
    opt(term(' ')),
    LINE_MATCHER,
    rep(LINE_MATCHER)
  ),

  [TokenType.BULLET_ORDERED]: cat(
    term('\n'),
    TokenType.WHITESPACE,
    TokenType.NATURAL_NUMBER,
    term('.', ')'),
    opt(term(' ')),
    LINE_MATCHER,
    rep(LINE_MATCHER)
  ),

  [TokenType.BULLET_LIST]: cat(
    alt(
      cat(TokenType.BULLET_UNORDERED, rep(TokenType.BULLET_UNORDERED)),
      cat(TokenType.BULLET_ORDERED, rep(TokenType.BULLET_ORDERED))
    ),
    term('\n')
  ),

  [TokenType.MARKDOWN]: cat(
    opt(TokenType.HEADING),
    opt(TokenType.BULLET_LIST),
    rep(
      alt(
        ...COMMON_RULES,
        TokenType.ANCHOR,
        TokenType.BULLET_LIST,
        TokenType.LINE_BREAK,
        wildcard
      )
    )
  )
})
