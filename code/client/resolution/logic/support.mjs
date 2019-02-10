import FormulaType from '../enums/formula_type.mjs'

export function negate (formula) {
  switch (formula.type) {
    case FormulaType.NEGATION:
      return formula.formula

    case FormulaType.IMPLICATION:
    case FormulaType.EQUIVALENCE:
    case FormulaType.PREDICATE:
      return { type: FormulaType.NEGATION, formula: formula }

    case FormulaType.UNIVERSAL_QUANTIFICATION:
      return {
        type: FormulaType.EXISTENTIAL_QUANTIFICATION,
        variable: formula.variable,
        formula: negate(formula.formula)
      }

    case FormulaType.EXISTENTIAL_QUANTIFICATION:
      return {
        type: FormulaType.UNIVERSAL_QUANTIFICATION,
        variable: formula.variable,
        formula: negate(formula.formula)
      }

    case FormulaType.CONJUNCTION:
      return {
        type: FormulaType.DISJUNCTION,
        formulas: formula.formulas.map(negate)
      }

    case FormulaType.DISJUNCTION:
      return {
        type: FormulaType.CONJUNCTION,
        formulas: formula.formulas.map(negate)
      }
  }
}
