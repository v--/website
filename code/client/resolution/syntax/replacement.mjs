import FormulaType from '../enums/formula_type.mjs'
import TermType from '../enums/term_type.mjs'

export function replaceVariables (formula, termMap) {
  switch (formula.type) {
    case TermType.VARIABLE:
      return termMap.get(formula.name) || formula

    case TermType.FUNCTION:
    case FormulaType.PREDICATE:
      return {
        type: formula.type,
        name: formula.name,
        args: formula.args.map(arg => replaceVariables(arg, termMap))
      }

    case FormulaType.NEGATION:
      return {
        type: formula.type,
        formula: replaceVariables(formula.formula, termMap)
      }
  }
}
