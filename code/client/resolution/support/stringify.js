import { ExpressionType } from '../enums/expression_type.js'

/**
 * @param {import('../types/expression.js').FOLExpression} expression
 * @returns {string}
 */
export function stringifyExpression(expression) {
  switch (expression.type) {
    case ExpressionType.variable:
      return expression.name

    case ExpressionType.function:
    case ExpressionType.predicate:
      if (expression.args.length > 0) {
        return expression.name + '(' + expression.args.map(stringifyExpression).join(', ') + ')'
      }

      return expression.name

    case ExpressionType.negation:
      return '¬' + stringifyExpression(expression.formula)

    case ExpressionType.universalQuantification:
      return '∀' + expression.variable + ' ' + stringifyExpression(expression.formula)

    case ExpressionType.existentialQuantification:
      return '∃' + expression.variable + ' ' + stringifyExpression(expression.formula)

    case ExpressionType.conjunction:
      return '(' + expression.formulas.map(stringifyExpression).join(' & ') + ')'

    case ExpressionType.disjunction:
      return '(' + expression.formulas.map(stringifyExpression).join(' ∨ ') + ')'

    case ExpressionType.implication:
      return '(' + expression.formulas.map(stringifyExpression).join(' → ') + ')'

    case ExpressionType.equivalence:
      return '(' + expression.formulas.map(stringifyExpression).join(' ↔ ') + ')'
  }
}

/**
 * @param {import('../types/expression.js').FOLDisjunct} disjunct
 * @returns {string}
 */
export function stringifyDisjunct(disjunct) {
  return '{' + disjunct.map(stringifyExpression).join(', ') + '}'
}

/**
 * @param {Required<import('../types/expression.js').FOLResolvent>} resolvent
 * @returns {string}
 */
export function stringifyResolvent(resolvent) {
  return `R(${
    resolvent.r1.index + 1
  }, ${
    resolvent.r2.index + 1
  }, ${
    stringifyExpression(resolvent.literal)
  }) = ${
    stringifyDisjunct(resolvent.disjunct)
  }`
}
