import FormulaType from '../enums/formula_type.mjs'

export function negate (formula) {
  switch (formula.type) {
    case FormulaType.NEGATION:
      return formula.formula

    case FormulaType.PREDICATE:
      return {
        type: FormulaType.NEGATION,
        formula
      }

    // Quantifier inversion rules
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

    // de Morgan's laws
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

function mostlyConvertToNNF (formula) {
  switch (formula.type) {
    case FormulaType.PREDICATE:
      return formula

    case FormulaType.NEGATION:
      return negate(mostlyConvertToNNF(formula.formula))

    case FormulaType.UNIVERSAL_QUANTIFICATION:
    case FormulaType.EXISTENTIAL_QUANTIFICATION:
      return {
        type: formula.type,
        variable: formula.variable,
        formula: mostlyConvertToNNF(formula.formula)
      }

    case FormulaType.CONJUNCTION:
    case FormulaType.DISJUNCTION:
      const subformulas = formula.formulas.map(mostlyConvertToNNF)
      const flattened = []

      for (const subf of subformulas) {
        if (subf.type === formula.type) {
          Array.prototype.push.apply(flattened, subf.formulas.map(mostlyConvertToNNF))
        } else {
          flattened.push(subf)
        }
      }

      return {
        type: formula.type,
        formulas: flattened
      }

    // P → Q ≡ ¬P ∨ Q
    case FormulaType.IMPLICATION:
      const [a, b] = formula.formulas.map(mostlyConvertToNNF)

      return mostlyConvertToNNF({
        type: FormulaType.DISJUNCTION,
        formulas: [negate(a), b]
      })

    // P ↔ Q ≡ (¬P ∨ Q) & (P ∨ ¬Q)
    case FormulaType.EQUIVALENCE:
      const [c, d] = formula.formulas.map(mostlyConvertToNNF)

      return mostlyConvertToNNF({
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
      })
  }
}

export function convertToNNF (formula) {
  var nnf = mostlyConvertToNNF(formula)

  if (nnf.type !== FormulaType.DISJUNCTION) {
    return nnf
  }

  const subformulas = nnf.formulas

  for (let i = 0; i < subformulas.length; i++) {
    const subf = subformulas[i]

    if (subf.type === FormulaType.CONJUNCTION) {
      const before = subformulas.slice(0, i)
      const after = subformulas.slice(i + 1)

      return {
        type: FormulaType.CONJUNCTION,
        formulas: subf.formulas.map(ssubf => ({
          type: FormulaType.DISJUNCTION,
          formulas: before.concat([mostlyConvertToNNF(ssubf)]).concat(after)
        }))
      }
    }
  }

  return nnf
}
