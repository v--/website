import { ExpressionType } from '../enums/expression_type.js'

export function stringifyExpression (expression) {
  switch (expression.type) {
    case ExpressionType.VARIABLE:
      return expression.name

    case ExpressionType.FUNCTION:
    case ExpressionType.PREDICATE:
      if (expression.args.length > 0) {
        return expression.name + '(' + expression.args.map(stringifyExpression).join(', ') + ')'
      }

      return expression.name

    case ExpressionType.NEGATION:
      return '¬' + stringifyExpression(expression.formula)

    case ExpressionType.UNIVERSAL_QUANTIFICATION:
      return '∀' + expression.variable + ' ' + stringifyExpression(expression.formula)

    case ExpressionType.EXISTENTIAL_QUANTIFICATION:
      return '∃' + expression.variable + ' ' + stringifyExpression(expression.formula)

    case ExpressionType.CONJUNCTION:
      return '(' + expression.formulas.map(stringifyExpression).join(' & ') + ')'

    case ExpressionType.DISJUNCTION:
      return '(' + expression.formulas.map(stringifyExpression).join(' ∨ ') + ')'

    case ExpressionType.IMPLICATION:
      return '(' + expression.formulas.map(stringifyExpression).join(' → ') + ')'

    case ExpressionType.EQUIVALENCE:
      return '(' + expression.formulas.map(stringifyExpression).join(' ↔ ') + ')'
  }
}

export function stringifyDisjunct (disjunct) {
  return '{' + disjunct.map(stringifyExpression).join(', ') + '}'
}

export function stringifyResolvent (resolvent) {
  return `R(${resolvent.r1.index + 1}, ${resolvent.r2.index + 1}, ${stringifyExpression(resolvent.literal)}) = ${stringifyDisjunct(resolvent.disjunct)}`
}
