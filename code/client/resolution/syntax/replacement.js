import ExpressionType from '../enums/expression_type.js'
import { CoolError } from '../../../common/errors.js'

export class ReplacementError extends CoolError {}

export function replaceVariables (expression, termMap) {
  switch (expression.type) {
    case ExpressionType.VARIABLE:
      return termMap.get(expression.name) || expression

    case ExpressionType.FUNCTION:
    case ExpressionType.PREDICATE:
      return {
        type: expression.type,
        name: expression.name,
        args: expression.args.map(arg => replaceVariables(arg, termMap))
      }

    case ExpressionType.NEGATION:
      return {
        type: expression.type,
        formula: replaceVariables(expression.formula, termMap)
      }

    case ExpressionType.CONJUNCTION:
    case ExpressionType.DISJUNCTION:
    case ExpressionType.IMPLICATION:
    case ExpressionType.EQUIVALENCE:
      return {
        type: expression.type,
        formulas: expression.formulas.map(arg => replaceVariables(arg, termMap))
      }

    case ExpressionType.UNIVERSAL_QUANTIFICATION:
    case ExpressionType.EXISTENTIAL_QUANTIFICATION:
      const replacement = termMap.get(expression.variable)

      if (replacement && replacement.type !== ExpressionType.VARIABLE) {
        throw new ReplacementError('Cannot replace bound variables with arbitrary terms')
      }

      return {
        type: expression.type,
        variable: replacement ? replacement.name : expression.variable,
        formula: replaceVariables(expression.formula, termMap)
      }
  }
}
