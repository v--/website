import TermType from '../enums/term_type.mjs'
import FormulaType from '../enums/formula_type.mjs'

export default function stringifyFormula (formula) {
  switch (formula.type) {
    case TermType.CONSTANT:
    case TermType.VARIABLE:
      return formula.name

    case TermType.FUNCTION:
    case FormulaType.PREDICATE:
      return formula.name + '(' + formula.args.map(stringifyFormula).join(', ') + ')'

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
