import { term, opt, rep, cat, alt } from '../../../common/support/parser.js'

export const folRules = Object.freeze({
  whitespace: rep(term(' ')),
  naturalNumber: cat(
    term('1', '2', '3', '4', '5', '6', '7', '8', '9'),
    rep(
      term('0', '1', '2', '3', '4', '5', '6', '7', '8', '9')
    )
  ),

  term: alt('variable', 'function'),
  formula: alt('predicate', 'negation', 'universalQuantification', 'existentialQuantification', 'connectiveFormula'),
  topLevelFormula: cat(
    'whitespace',
    alt('conjunction', 'disjunction', 'implication', 'equivalence', 'formula'),
    'whitespace'
  ),

  arguments: cat(
    term('('),
    'whitespace',
    'term',
    rep(
      cat(
        'whitespace',
        term(','),
        'whitespace',
        'term'
      )
    ),
    'whitespace',
    term(')')
  ),

  variable: cat(
    term('x', 'y', 'z'),
    opt('naturalNumber')
  ),

  functionName: cat(
    term('f', 'g', 'h'),
    opt('naturalNumber')
  ),

  function: cat(
    'functionName',
    opt('arguments')
  ),

  predicateName: cat(
    term('p', 'q', 'r'),
    opt('naturalNumber')
  ),

  predicate: cat(
    'predicateName',
    'arguments'
  ),

  negation: cat(
    term('!'),
    'formula'
  ),

  universalQuantification: cat(
    term('A'),
    'whitespace',
    'variable',
    'whitespace',
    'formula'
  ),

  existentialQuantification: cat(
    term('E'),
    'whitespace',
    'variable',
    'whitespace',
    'formula'
  ),

  conjunction: cat(
    'formula',
    'whitespace',
    term('&'),
    'whitespace',
    'formula',
    rep(
      cat(
        'whitespace',
        term('&'),
        'whitespace',
        'formula'
      )
    )
  ),

  disjunction: cat(
    'formula',
    'whitespace',
    term('v'),
    'whitespace',
    'formula',
    rep(
      cat(
        'whitespace',
        term('v'),
        'whitespace',
        'formula'
      )
    )
  ),

  implication: cat(
    'formula',
    'whitespace',
    term('->'),
    'whitespace',
    'formula'
  ),

  equivalence: cat(
    'formula',
    'whitespace',
    term('<->'),
    'whitespace',
    'formula'
  ),

  connectiveFormula: cat(
    term('('),
    'whitespace',
    alt('conjunction', 'disjunction', 'implication', 'equivalence'),
    'whitespace',
    term(')')
  )
})
