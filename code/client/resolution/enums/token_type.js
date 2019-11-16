import { enumerate } from '../../../common/support/enumerate.js'

export const TokenType = enumerate(
  'WHITESPACE',
  'NATURAL_NUMBER',
  'VARIABLE',
  'FUNCTION',
  'FUNCTION_NAME',
  'PREDICATE_NAME',
  'PREDICATE',
  'NEGATION',
  'TERM',
  'ARGUMENTS',
  'FORMULA',
  'UNIVERSAL_QUANTIFICATION',
  'EXISTENTIAL_QUANTIFICATION',
  'CONJUNCTION',
  'DISJUNCTION',
  'IMPLICATION',
  'EQUIVALENCE',
  'CONNECTIVE_FORMULA'
)
