import { wildcard, term, neg, opt, rep, cat, alt } from '../../../common/support/parser.mjs'

import TokenType from './token_type.mjs'

const COMMON_RULES = [
  TokenType.ANCHOR,
  TokenType.ANCHOR_NODE,
  TokenType.ANCHOR_LINK,
  TokenType.CODE_BLOCK,
  TokenType.CODE,
  TokenType.EMPHASIS,
  TokenType.HEADING
  // TokenType.BULLET
]

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

function createNestedLineRule (sigil) {
  const srule = term(sigil)
  const matcher = alt(...COMMON_RULES, neg('\n'))
  return cat(
    srule,
    rep(srule),
    opt(term(' ')),
    matcher,
    rep(matcher),
    term('\n')
  )
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

  [TokenType.HEADING]: createNestedLineRule('#'),
  [TokenType.BULLET]: createNestedLineRule('*'),
  [TokenType.MARKDOWN]: rep(alt(...COMMON_RULES, TokenType.LINE_BREAK, wildcard))
})
