import { term, opt, rep, cat, alt } from '../../../common/support/parser.js'

import { TokenType } from '../enums/token_type.js'

export const folRules = Object.freeze({
  [TokenType.WHITESPACE]: rep(term(' ')),
  [TokenType.NATURAL_NUMBER]: cat(
    term('1', '2', '3', '4', '5', '6', '7', '8', '9'),
    rep(
      term('0', '1', '2', '3', '4', '5', '6', '7', '8', '9')
    )
  ),

  [TokenType.TERM]: alt(TokenType.VARIABLE, TokenType.FUNCTION),
  [TokenType.FORMULA]: alt(TokenType.PREDICATE, TokenType.NEGATION, TokenType.UNIVERSAL_QUANTIFICATION, TokenType.EXISTENTIAL_QUANTIFICATION, TokenType.CONNECTIVE_FORMULA),
  [TokenType.TOP_LEVEL_FORMULA]: cat(
    TokenType.WHITESPACE,
    alt(TokenType.CONJUNCTION, TokenType.DISJUNCTION, TokenType.IMPLICATION, TokenType.EQUIVALENCE, TokenType.FORMULA),
    TokenType.WHITESPACE
  ),

  [TokenType.ARGUMENTS]: cat(
    term('('),
    TokenType.WHITESPACE,
    TokenType.TERM,
    rep(
      cat(
        TokenType.WHITESPACE,
        term(','),
        TokenType.WHITESPACE,
        TokenType.TERM
      )
    ),
    TokenType.WHITESPACE,
    term(')')
  ),

  [TokenType.VARIABLE]: cat(
    term('x', 'y', 'z'),
    opt(TokenType.NATURAL_NUMBER)
  ),

  [TokenType.FUNCTION_NAME]: cat(
    term('f', 'g', 'h'),
    opt(TokenType.NATURAL_NUMBER)
  ),

  [TokenType.FUNCTION]: cat(
    TokenType.FUNCTION_NAME,
    opt(TokenType.ARGUMENTS)
  ),

  [TokenType.PREDICATE_NAME]: cat(
    term('p', 'q', 'r'),
    opt(TokenType.NATURAL_NUMBER)
  ),

  [TokenType.PREDICATE]: cat(
    TokenType.PREDICATE_NAME,
    TokenType.ARGUMENTS
  ),

  [TokenType.NEGATION]: cat(
    term('!'),
    TokenType.FORMULA
  ),

  [TokenType.UNIVERSAL_QUANTIFICATION]: cat(
    term('A'),
    TokenType.WHITESPACE,
    TokenType.VARIABLE,
    TokenType.WHITESPACE,
    TokenType.FORMULA
  ),

  [TokenType.EXISTENTIAL_QUANTIFICATION]: cat(
    term('E'),
    TokenType.WHITESPACE,
    TokenType.VARIABLE,
    TokenType.WHITESPACE,
    TokenType.FORMULA
  ),

  [TokenType.CONJUNCTION]: cat(
    TokenType.FORMULA,
    TokenType.WHITESPACE,
    term('&'),
    TokenType.WHITESPACE,
    TokenType.FORMULA,
    rep(
      cat(
        TokenType.WHITESPACE,
        term('&'),
        TokenType.WHITESPACE,
        TokenType.FORMULA
      )
    )
  ),

  [TokenType.DISJUNCTION]: cat(
    TokenType.FORMULA,
    TokenType.WHITESPACE,
    term('v'),
    TokenType.WHITESPACE,
    TokenType.FORMULA,
    rep(
      cat(
        TokenType.WHITESPACE,
        term('v'),
        TokenType.WHITESPACE,
        TokenType.FORMULA
      )
    )
  ),

  [TokenType.IMPLICATION]: cat(
    TokenType.FORMULA,
    TokenType.WHITESPACE,
    term('->'),
    TokenType.WHITESPACE,
    TokenType.FORMULA
  ),

  [TokenType.EQUIVALENCE]: cat(
    TokenType.FORMULA,
    TokenType.WHITESPACE,
    term('<->'),
    TokenType.WHITESPACE,
    TokenType.FORMULA
  ),

  [TokenType.CONNECTIVE_FORMULA]: cat(
    term('('),
    TokenType.WHITESPACE,
    alt(TokenType.CONJUNCTION, TokenType.DISJUNCTION, TokenType.IMPLICATION, TokenType.EQUIVALENCE),
    TokenType.WHITESPACE,
    term(')')
  )
})
