import { enumerate } from '../../../common/support/enumerate.js'

export const ExpressionType = enumerate(
  'VARIABLE',
  'FUNCTION',
  'PREDICATE',
  'NEGATION',
  'UNIVERSAL_QUANTIFICATION',
  'EXISTENTIAL_QUANTIFICATION',
  'CONJUNCTION',
  'DISJUNCTION',
  'IMPLICATION',
  'EQUIVALENCE'
)
