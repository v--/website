import { ExpressionType } from '../enums/expression_type.js'
import { CoolError } from '../../../common/errors.js'
import { FOLExpression, FOLFormula, FOLTerm, NegationExpression } from '../types/expression.js'

export class ReplacementError extends CoolError {}

export function replaceVariables(expression: FOLExpression, termMap: Map<string, FOLTerm>): FOLExpression {
  switch (expression.type) {
    case ExpressionType.variable:
      return termMap.get(expression.name) || expression

    case ExpressionType.function:
    case ExpressionType.predicate:
      return {
        type: expression.type,
        name: expression.name,
        args: expression.args.map(arg => replaceVariables(arg, termMap) as FOLTerm)
      }

    case ExpressionType.negation:
      return {
        type: expression.type,
        formula: replaceVariables(expression.formula, termMap)
      } as NegationExpression

    case ExpressionType.conjunction:
    case ExpressionType.disjunction:
    case ExpressionType.implication:
    case ExpressionType.equivalence:
      return {
        type: expression.type,
        formulas: expression.formulas.map(arg => replaceVariables(arg, termMap) as FOLFormula)
      }

    case ExpressionType.universalQuantification:
    case ExpressionType.existentialQuantification:
    {
      const replacement = termMap.get(expression.variable)

      if (replacement && replacement.type !== ExpressionType.variable) {
        throw new ReplacementError('Cannot replace bound variables with arbitrary terms')
      }

      return {
        type: expression.type,
        variable: replacement ? replacement.name : expression.variable,
        formula: replaceVariables(expression.formula, termMap) as FOLFormula
      }
    }
  }
}
