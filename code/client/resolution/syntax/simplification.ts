import { ExpressionType } from '../enums/expression_type.js'
import { FOLFormula, SimplifiedFormula, SimplifiedInnerFormula } from '../types/expression.js'

export function negate(expression: FOLFormula): FOLFormula {
  switch (expression.type) {
    case ExpressionType.negation:
      return expression.formula

    case ExpressionType.predicate:
      return {
        type: ExpressionType.negation,
        formula: expression
      }

    // Quantifier inversion rules
    case ExpressionType.universalQuantification:
      return {
        type: ExpressionType.existentialQuantification,
        variable: expression.variable,
        formula: negate(expression.formula)
      }

    case ExpressionType.existentialQuantification:
      return {
        type: ExpressionType.universalQuantification,
        variable: expression.variable,
        formula: negate(expression.formula)
      }

    // de Morgan's laws
    case ExpressionType.conjunction:
      return {
        type: ExpressionType.disjunction,
        formulas: expression.formulas.map(negate)
      }

    case ExpressionType.disjunction:
      return {
        type: ExpressionType.conjunction,
        formulas: expression.formulas.map(negate)
      }

    case ExpressionType.implication:
      return {
        type: ExpressionType.implication,
        formulas: [negate(expression.formulas[1]), negate(expression.formulas[0])]
      }

    case ExpressionType.equivalence:
      return {
        type: ExpressionType.equivalence,
        formulas: [negate(expression.formulas[0]), negate(expression.formulas[1])]
      }
  }
}

function mostlyConvertToCNF(expression: FOLFormula): FOLFormula {
  switch (expression.type) {
    case ExpressionType.predicate:
      return expression

    case ExpressionType.negation:
      return negate(simplify(expression.formula))

    case ExpressionType.universalQuantification:
    case ExpressionType.existentialQuantification:
      return {
        type: expression.type,
        variable: expression.variable,
        formula: simplify(expression.formula)
      }

    case ExpressionType.conjunction:
    case ExpressionType.disjunction:
    {
      const subformulas = expression.formulas.map(simplify)
      const flattened = []

      for (const subf of subformulas) {
        if (subf.type === expression.type) {
          flattened.push(...(subf.formulas as FOLFormula[]).map(simplify))
        } else {
          flattened.push(subf)
        }
      }

      return {
        type: expression.type,
        formulas: flattened
      }
    }

    // P → Q ≡ ¬P ∨ Q
    case ExpressionType.implication:
    {
      const [a, b] = expression.formulas.map(simplify)

      return simplify({
        type: ExpressionType.disjunction,
        formulas: [negate(a), b]
      })
    }

    // P ↔ Q ≡ (¬P ∨ Q) & (P ∨ ¬Q)
    case ExpressionType.equivalence:
    {
      const [c, d] = expression.formulas.map(simplify)

      return simplify({
        type: ExpressionType.conjunction,
        formulas: [
          {
            type: ExpressionType.disjunction,
            formulas: [negate(c), d]
          },
          {
            type: ExpressionType.disjunction,
            formulas: [c, negate(d)]
          }
        ]
      })
    }
  }
}

export function simplify(expression: FOLFormula): SimplifiedFormula {
  const cnf = mostlyConvertToCNF(expression)

  if (cnf.type !== ExpressionType.disjunction) {
    return cnf as SimplifiedFormula
  }

  const subformulas = cnf.formulas

  for (let i = 0; i < subformulas.length; i++) {
    const subf = subformulas[i]

    if (subf.type === ExpressionType.conjunction) {
      const before = subformulas.slice(0, i) as SimplifiedInnerFormula[]
      const after = subformulas.slice(i + 1) as SimplifiedInnerFormula[]

      return {
        type: ExpressionType.conjunction,
        formulas: subf.formulas.map(ssubf => ({
          type: ExpressionType.disjunction,
          formulas: before.concat([simplify(ssubf) as SimplifiedInnerFormula]).concat(after)
        }))
      }
    }
  }

  return cnf as SimplifiedFormula
}
