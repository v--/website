import { ExpressionType } from '../enums/expression_type.js'
import { FOLDisjunct, FOLExpression, FOLResolvent } from '../types/expression.js'

export function stringifyExpression(expression: FOLExpression): string {
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

export function stringifyDisjunct(disjunct: FOLDisjunct) {
  return '{' + disjunct.map(stringifyExpression).join(', ') + '}'
}

export function stringifyResolvent(resolvent: FOLResolvent) {
  return `R(${resolvent.r1!.index + 1}, ${resolvent.r2!.index + 1}, ${stringifyExpression(resolvent.literal!)}) = ${stringifyDisjunct(resolvent.disjunct)}`
}
