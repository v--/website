import ExpressionType from '../enums/expression_type.js'
import { replaceVariables } from './replacement.js'

export function convertToSNF (formula, counter = { value: 1 }, nameMap = new Map(), univVarNames = []) {
  switch (formula.type) {
    case ExpressionType.PREDICATE:
      return {
        type: formula.type,
        name: formula.name,
        args: formula.args.map(function (term) {
          return replaceVariables(term, nameMap)
        })
      }

    case ExpressionType.UNIVERSAL_QUANTIFICATION:
      return {
        type: formula.type,
        variable: formula.variable,
        formula: convertToSNF(formula.formula, counter, nameMap, univVarNames.concat([formula.variable]))
      }

    case ExpressionType.EXISTENTIAL_QUANTIFICATION:
      nameMap.set(formula.variable, {
        type: ExpressionType.FUNCTION,
        name: 'u' + counter.value++,
        args: univVarNames.map(function (varName) {
          return { type: ExpressionType.VARIABLE, name: varName }
        })
      })

      return convertToSNF(formula.formula, counter, nameMap, univVarNames)

    case ExpressionType.NEGATION:
      return {
        type: formula.type,
        formula: convertToSNF(formula.formula, counter, nameMap, univVarNames)
      }

    case ExpressionType.CONJUNCTION:
    case ExpressionType.DISJUNCTION:
      return {
        type: formula.type,
        formulas: formula.formulas.map(f => convertToSNF(f, counter, nameMap, univVarNames))
      }
  }
}
