import TermType from '../enums/term_type.mjs'
import FormulaType from '../enums/formula_type.mjs'
import { CoolError } from '../../../common/errors.mjs'

export class ReplacementError extends CoolError {}

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

    case FormulaType.CONJUNCTION:
    case FormulaType.DISJUNCTION:
    case FormulaType.IMPLICATION:
    case FormulaType.EQUIVALENCE:
      return {
        type: formula.type,
        formulas: formula.formulas.map(arg => replaceVariables(arg, termMap))
      }

    case FormulaType.UNIVERSAL_QUANTIFICATION:
    case FormulaType.EXISTENTIAL_QUANTIFICATION:
      const replacement = termMap.get(formula.variable)

      if (replacement && replacement.type !== TermType.VARIABLE) {
        throw new ReplacementError('Cannot replace bound variables with arbitrary terms')
      }

      return {
        type: formula.type,
        variable: replacement ? replacement.name : formula.variable,
        formula: replaceVariables(formula.formula, termMap)
      }
  }
}
