import { CoolError } from '../../../common/errors.js'

export class ReplacementError extends CoolError {}

export function replaceVariables(expression: Resolution.FOLExpression, termMap: Map<string, Resolution.FOLTerm>): Resolution.FOLExpression {
  switch (expression.type) {
    case 'variable':
      return termMap.get(expression.name) || expression

    case 'function':
    case 'predicate':
      return {
        type: expression.type,
        name: expression.name,
        args: expression.args.map(arg => replaceVariables(arg, termMap) as Resolution.FOLTerm)
      }

    case 'negation':
      return {
        type: expression.type,
        formula: replaceVariables(expression.formula, termMap)
      } as Resolution.NegationExpression

    case 'conjunction':
    case 'disjunction':
    case 'implication':
    case 'equivalence':
      return {
        type: expression.type,
        formulas: expression.formulas.map(arg => replaceVariables(arg, termMap) as Resolution.FOLFormula)
      }

    case 'universalQuantification':
    case 'existentialQuantification':
    {
      const replacement = termMap.get(expression.variable)

      if (replacement && replacement.type !== 'variable') {
        throw new ReplacementError('Cannot replace bound variables with arbitrary terms')
      }

      return {
        type: expression.type,
        variable: replacement ? replacement.name : expression.variable,
        formula: replaceVariables(expression.formula, termMap) as Resolution.FOLFormula
      }
    }
  }
}
