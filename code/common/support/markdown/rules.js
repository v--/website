import { wildcard, term, neg, opt, rep, cat, alt } from '../../../common/support/parser.js'

const COMMON_RULES = [
  'codeBlock',
  'code',
  'veryStrongEmphasis',
  'strongEmphasis',
  'emphasis',
  cat('lineBreak', 'heading')
]

const LINE_MATCHER = alt(...COMMON_RULES, 'anchor', neg('\n'))

/**
 * @param {string} start
 * @param {string} end
 * @param {TParsing.IParserRule} matcher
 */
function createBlockRule(start, end, matcher = alt(term('\\' + end), neg(end, '\n'))) {
  return cat(
    term(start),
    matcher,
    rep(matcher),
    term(end)
  )
}

/**
 * @param {string} start
 * @param {string} end
 * @param {TParsing.RefType[]} rules
 * @param {TParsing.IParserRule} matcher
 */
function createNestedBlockRule(start, end, rules, matcher = alt(term('\\' + end), neg(end, '\n'))) {
  return createBlockRule(start, end, alt(...rules, 'lineBreak', matcher))
}

export const markdownRules = Object.freeze({
  whitespace: rep(term(' ')),
  lineBreak: cat(term('\n'), 'whitespace'),

  naturalNumbers: cat(
    term('1', '2', '3', '4', '5', '6', '7', '8', '9'),
    rep(
      term('0', '1', '2', '3', '4', '5', '6', '7', '8', '9')
    )
  ),

  anchorNode: createNestedBlockRule('[', ']', COMMON_RULES),
  anchorHref: createBlockRule('(', ')'),
  anchor: cat('anchorNode', 'anchorHref'),

  codeBlock: createBlockRule('```', '```', alt(term('\\`'), neg('```'))),
  code: createBlockRule('`', '`'),

  veryStrongEmphasis: alt(
    createBlockRule('***', '***'),
    createBlockRule('___', '___')
  ),

  strongEmphasis: alt(
    createBlockRule('**', '**'),
    createBlockRule('__', '__')
  ),

  emphasis: alt(
    createBlockRule('*', '*'),
    createBlockRule('_', '_')
  ),

  heading: cat(
    term('#'),
    rep(term('#')),
    opt(term(' ')),
    LINE_MATCHER,
    rep(LINE_MATCHER),
    term('\n')
  ),

  bulletUnordered: cat(
    term('\n'),
    'whitespace',
    term('+', '*'),
    opt(term(' ')),
    LINE_MATCHER,
    rep(LINE_MATCHER)
  ),

  bulletOrdered: cat(
    term('\n'),
    'whitespace',
    'naturalNumbers',
    term('.', ')'),
    opt(term(' ')),
    LINE_MATCHER,
    rep(LINE_MATCHER)
  ),

  bulletList: cat(
    alt(
      cat('bulletUnordered', rep('bulletUnordered')),
      cat('bulletOrdered', rep('bulletOrdered'))
    ),
    term('\n')
  ),

  markdown: cat(
    opt('heading'),
    opt('bulletList'),
    rep(
      alt(
        ...COMMON_RULES,
        'anchor',
        'bulletList',
        'lineBreak',
        wildcard
      )
    )
  )
})
