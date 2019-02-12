import TermType from '../enums/term_type.mjs'
import FormulaType from '../enums/formula_type.mjs'
import { replaceVariables } from './replacement.mjs'

export function convertToSNF (formula, counter = { value: 1 }, nameMap = new Map(), univVarNames = []) {
  switch (formula.type) {
    case FormulaType.PREDICATE:
      return {
        type: formula.type,
        name: formula.name,
        args: formula.args.map(function (term) {
          return replaceVariables(term, nameMap)
        })
      }

    case FormulaType.UNIVERSAL_QUANTIFICATION:
      return convertToSNF(formula.formula, counter, nameMap, univVarNames.concat([formula.variable]))

    case FormulaType.EXISTENTIAL_QUANTIFICATION:
      nameMap.set(formula.variable, {
        type: TermType.FUNCTION,
        name: 'u' + counter.value++,
        args: univVarNames.map(function (varName) {
          return { type: TermType.VARIABLE, name: varName }
        })
      })

      return convertToSNF(formula.formula, counter, nameMap, univVarNames)

    case FormulaType.NEGATION:
      return {
        type: formula.type,
        formula: convertToSNF(formula.formula, counter, nameMap, univVarNames)
      }

    case FormulaType.CONJUNCTION:
    case FormulaType.DISJUNCTION:
      return {
        type: formula.type,
        formulas: formula.formulas.map(f => convertToSNF(f, counter, nameMap, univVarNames))
      }
  }
}
