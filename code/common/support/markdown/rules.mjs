import { wildcard, term, neg, opt, rep, cat, alt } from '../../../common/support/parser.mjs'

import TokenType from './token_type.mjs'

const COMMON_RULES = [
  TokenType.ANCHOR,
  TokenType.ANCHOR_NODE,
  TokenType.ANCHOR_LINK,
  TokenType.CODE_BLOCK,
  TokenType.CODE,
  TokenType.EMPHASIS,
  cat(TokenType.LINE_BREAK, TokenType.HEADING)
]

const LINE_MATCHER = alt(...COMMON_RULES, neg('\n'))

function createBlockRule (start, end, matcher = alt(term('\\' + end), neg(end, '\n'))) {
  return cat(
    term(start),
    matcher,
    rep(matcher),
    term(end)
  )
}

function createNestedBlockRule (start, end, matcher = alt(term('\\' + end), neg(end, '\n'))) {
  return createBlockRule(start, end, alt(...COMMON_RULES, TokenType.LINE_BREAK, matcher))
}

export default Object.freeze({
  [TokenType.WHITESPACE]: rep(term(' ')),
  [TokenType.LINE_BREAK]: cat(term('\n'), TokenType.WHITESPACE),

  [TokenType.ANCHOR_NODE]: createNestedBlockRule('[', ']'),
  [TokenType.ANCHOR_LINK]: createBlockRule('(', ')'),
  [TokenType.ANCHOR]: cat(TokenType.ANCHOR_NODE, TokenType.ANCHOR_LINK),

  [TokenType.CODE_BLOCK]: createBlockRule('```', '```', alt(term('\\`'), neg('```'))),
  [TokenType.CODE]: createBlockRule('`', '`'),

  [TokenType.EMPHASIS]: alt(
    createNestedBlockRule('*', '*'),
    createNestedBlockRule('_', '_')
  ),

  [TokenType.HEADING]: cat(
    term('#'),
    rep(term('#')),
    opt(term(' ')),
    LINE_MATCHER,
    rep(LINE_MATCHER),
    term('\n')
  ),

  [TokenType.BULLET]: cat(
    term('\n'),
    TokenType.WHITESPACE,
    term('*'),
    opt(term(' ')),
    LINE_MATCHER,
    rep(LINE_MATCHER)
  ),

  [TokenType.BULLET_LIST]: cat(
    TokenType.BULLET,
    rep(TokenType.BULLET),
    term('\n')
  ),

  [TokenType.MARKDOWN]: cat(
    opt(TokenType.HEADING),
    opt(TokenType.BULLET_LIST),
    rep(
      alt(
        ...COMMON_RULES,
        TokenType.BULLET_LIST,
        TokenType.LINE_BREAK,
        wildcard
      )
    )
  )
})
