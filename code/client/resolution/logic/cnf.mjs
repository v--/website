import FormulaType from '../enums/formula_type.mjs'
import { negate } from '../logic/support.mjs'

export function simplify (formula) {
  switch (formula.type) {
    case FormulaType.PREDICATE:
      return formula

    case FormulaType.NEGATION:
      return negate(simplify(formula.formula))

    case FormulaType.UNIVERSAL_QUANTIFICATION:
    case FormulaType.EXISTENTIAL_QUANTIFICATION:
      return {
        type: formula.type,
        variable: formula.variable,
        formula: simplify(formula.formula)
      }

    case FormulaType.CONJUNCTION:
    case FormulaType.DISJUNCTION:
      return {
        type: formula.type,
        formulas: formula.formulas.map(simplify)
      }

    case FormulaType.IMPLICATION:
      const [a, b] = formula.formulas.map(simplify)

      return {
        type: FormulaType.DISJUNCTION,
        formulas: [negate(a), b]
      }

    case FormulaType.EQUIVALENCE:
      const [c, d] = formula.formulas.map(simplify)

      return {
        type: FormulaType.CONJUNCTION,
        formulas: [
          {
            type: FormulaType.DISJUNCTION,
            formulas: [negate(c), d]
          },
          {
            type: FormulaType.DISJUNCTION,
            formulas: [c, negate(d)]
          }
        ]
      }
  }
}
