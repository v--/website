import { CoolError } from '../../../common/errors.js'

export class ReplacementError extends CoolError {}

/**
 * @param {TResolution.Expression} expression
 * @param {TResolution.NameMap} termMap
 * @returns {TResolution.Expression}
 */
export function replaceVariables(expression, termMap) {
  switch (expression.type) {
    case 'variable':
      return termMap.get(expression.name) || expression

    case 'function':
    case 'predicate':
      return {
        type: expression.type,
        name: expression.name,
        args: expression.args.map(arg => /** @type {TResolution.Term} */ (replaceVariables(arg, termMap)))
      }

    case 'negation':
      return {
        type: 'negation',
        formula: /** @type {TResolution.Formula} */ (
          replaceVariables(expression.formula, termMap)
        )
      }

    case 'conjunction':
    case 'disjunction':
    case 'implication':
    case 'equivalence':
      return {
        type: expression.type,
        formulas: expression.formulas.map(arg => /** @type {TResolution.Formula} */ (replaceVariables(arg, termMap)))
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
        formula: /** @type {TResolution.Formula} */ (
          replaceVariables(expression.formula, termMap)
        )
      }
    }
  }
}
