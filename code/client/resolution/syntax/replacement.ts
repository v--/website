import { CoolError } from '../../../common/errors.js'

export class ReplacementError extends CoolError {}

export function replaceVariables(expression: TResolution.FOLExpression, termMap: Map<string, TResolution.FOLTerm>): TResolution.FOLExpression {
  switch (expression.type) {
    case 'variable':
      return termMap.get(expression.name) || expression

    case 'function':
    case 'predicate':
      return {
        type: expression.type,
        name: expression.name,
        args: expression.args.map(arg => replaceVariables(arg, termMap) as TResolution.FOLTerm)
      }

    case 'negation':
      return {
        type: expression.type,
        formula: replaceVariables(expression.formula, termMap)
      } as TResolution.NegationExpression

    case 'conjunction':
    case 'disjunction':
    case 'implication':
    case 'equivalence':
      return {
        type: expression.type,
        formulas: expression.formulas.map(arg => replaceVariables(arg, termMap) as TResolution.FOLFormula)
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
        formula: replaceVariables(expression.formula, termMap) as TResolution.FOLFormula
      }
    }
  }
}
