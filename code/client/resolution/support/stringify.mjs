import TermType from '../enums/term_type.mjs'
import FormulaType from '../enums/formula_type.mjs'

export function stringifyFormula (formula) {
  switch (formula.type) {
    case TermType.VARIABLE:
      return formula.name

    case TermType.FUNCTION:
    case FormulaType.PREDICATE:
      if (formula.args.length > 0) {
        return formula.name + '(' + formula.args.map(stringifyFormula).join(', ') + ')'
      }

      return formula.name

    case FormulaType.NEGATION:
      return '¬' + stringifyFormula(formula.formula)

    case FormulaType.UNIVERSAL_QUANTIFICATION:
      return '∀' + formula.variable + ' ' + stringifyFormula(formula.formula)

    case FormulaType.EXISTENTIAL_QUANTIFICATION:
      return '∃' + formula.variable + ' ' + stringifyFormula(formula.formula)

    case FormulaType.CONJUNCTION:
      return '(' + formula.formulas.map(stringifyFormula).join(' & ') + ')'

    case FormulaType.DISJUNCTION:
      return '(' + formula.formulas.map(stringifyFormula).join(' ∨ ') + ')'

    case FormulaType.IMPLICATION:
      return '(' + formula.formulas.map(stringifyFormula).join(' → ') + ')'

    case FormulaType.EQUIVALENCE:
      return '(' + formula.formulas.map(stringifyFormula).join(' ↔ ') + ')'
  }
}

export function stringifyDisjunct (disjunct) {
  return '{' + disjunct.map(stringifyFormula).join(', ') + '}'
}

export function stringifyResolvent (resolvent) {
  return `R(${resolvent.d1 + 1}, ${resolvent.d2 + 1}, ${stringifyFormula(resolvent.literal)}) = ${stringifyDisjunct(resolvent.disjunct)}`
}
