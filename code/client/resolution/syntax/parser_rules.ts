import { term, opt, rep, cat, alt } from '../../../common/support/parser.js'

import { TokenType } from '../enums/token_type.js'

export const folRules = Object.freeze({
  [TokenType.whitespace]: rep(term(' ')),
  [TokenType.naturalNumber]: cat(
    term('1', '2', '3', '4', '5', '6', '7', '8', '9'),
    rep(
      term('0', '1', '2', '3', '4', '5', '6', '7', '8', '9')
    )
  ),

  [TokenType.term]: alt(TokenType.variable, TokenType.function),
  [TokenType.formula]: alt(TokenType.predicate, TokenType.negation, TokenType.universalQuantification, TokenType.existentialQuantification, TokenType.connectiveFormula),
  [TokenType.topLevelFormula]: cat(
    TokenType.whitespace,
    alt(TokenType.conjunction, TokenType.disjunction, TokenType.implication, TokenType.equivalence, TokenType.formula),
    TokenType.whitespace
  ),

  [TokenType.arguments]: cat(
    term('('),
    TokenType.whitespace,
    TokenType.term,
    rep(
      cat(
        TokenType.whitespace,
        term(','),
        TokenType.whitespace,
        TokenType.term
      )
    ),
    TokenType.whitespace,
    term(')')
  ),

  [TokenType.variable]: cat(
    term('x', 'y', 'z'),
    opt(TokenType.naturalNumber)
  ),

  [TokenType.functionName]: cat(
    term('f', 'g', 'h'),
    opt(TokenType.naturalNumber)
  ),

  [TokenType.function]: cat(
    TokenType.functionName,
    opt(TokenType.arguments)
  ),

  [TokenType.predicateName]: cat(
    term('p', 'q', 'r'),
    opt(TokenType.naturalNumber)
  ),

  [TokenType.predicate]: cat(
    TokenType.predicateName,
    TokenType.arguments
  ),

  [TokenType.negation]: cat(
    term('!'),
    TokenType.formula
  ),

  [TokenType.universalQuantification]: cat(
    term('A'),
    TokenType.whitespace,
    TokenType.variable,
    TokenType.whitespace,
    TokenType.formula
  ),

  [TokenType.existentialQuantification]: cat(
    term('E'),
    TokenType.whitespace,
    TokenType.variable,
    TokenType.whitespace,
    TokenType.formula
  ),

  [TokenType.conjunction]: cat(
    TokenType.formula,
    TokenType.whitespace,
    term('&'),
    TokenType.whitespace,
    TokenType.formula,
    rep(
      cat(
        TokenType.whitespace,
        term('&'),
        TokenType.whitespace,
        TokenType.formula
      )
    )
  ),

  [TokenType.disjunction]: cat(
    TokenType.formula,
    TokenType.whitespace,
    term('v'),
    TokenType.whitespace,
    TokenType.formula,
    rep(
      cat(
        TokenType.whitespace,
        term('v'),
        TokenType.whitespace,
        TokenType.formula
      )
    )
  ),

  [TokenType.implication]: cat(
    TokenType.formula,
    TokenType.whitespace,
    term('->'),
    TokenType.whitespace,
    TokenType.formula
  ),

  [TokenType.equivalence]: cat(
    TokenType.formula,
    TokenType.whitespace,
    term('<->'),
    TokenType.whitespace,
    TokenType.formula
  ),

  [TokenType.connectiveFormula]: cat(
    term('('),
    TokenType.whitespace,
    alt(TokenType.conjunction, TokenType.disjunction, TokenType.implication, TokenType.equivalence),
    TokenType.whitespace,
    term(')')
  )
})
