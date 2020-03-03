import { wildcard, term, neg, opt, rep, cat, alt } from '../../../common/support/parser.js'

import { TokenType } from './token_type.js'

const COMMON_RULES = [
  TokenType.ANCHOR,
  TokenType.ANCHOR_NODE,
  TokenType.ANCHOR_LINK,
  TokenType.CODE_BLOCK,
  TokenType.CODE,
  cat(TokenType.LINE_BREAK, TokenType.HEADING)
]

const COMMON_RULES_WITH_EMPHASIS = [
  ...COMMON_RULES,
  TokenType.STRONG_EMPHASIS,
  TokenType.EMPHASIS
]

const LINE_MATCHER = alt(...COMMON_RULES_WITH_EMPHASIS, neg('\n'))

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

  [TokenType.ANCHOR_NODE]: createNestedBlockRule('[', ']', COMMON_RULES_WITH_EMPHASIS),
  [TokenType.ANCHOR_LINK]: createBlockRule('(', ')'),
  [TokenType.ANCHOR]: cat(TokenType.ANCHOR_NODE, TokenType.ANCHOR_LINK),

  [TokenType.CODE_BLOCK]: createBlockRule('```', '```', alt(term('\\`'), neg('```'))),
  [TokenType.CODE]: createBlockRule('`', '`'),

  [TokenType.STRONG_EMPHASIS]: createNestedBlockRule('**', '**', [...COMMON_RULES, TokenType.EMPHASIS]),
  [TokenType.EMPHASIS]: createNestedBlockRule('*', '*', COMMON_RULES),

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
    term('+', '*'),
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
        ...COMMON_RULES_WITH_EMPHASIS,
        TokenType.BULLET_LIST,
        TokenType.LINE_BREAK,
        wildcard
      )
    )
  )
})
