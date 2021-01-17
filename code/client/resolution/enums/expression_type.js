import { createEnum } from '../../../common/support/enums.js'

/**
 * @enum {number}
 */
export const ExpressionType = createEnum(
  'variable',
  'function',
  'predicate',
  'negation',
  'universalQuantification',
  'existentialQuantification',
  'conjunction',
  'disjunction',
  'implication',
  'equivalence'
)
