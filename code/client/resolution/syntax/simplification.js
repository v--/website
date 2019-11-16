import { ExpressionType } from '../enums/expression_type.js'

export function negate (expression) {
  switch (expression.type) {
    case ExpressionType.NEGATION:
      return expression.formula

    case ExpressionType.PREDICATE:
      return {
        type: ExpressionType.NEGATION,
        formula: expression
      }

    // Quantifier inversion rules
    case ExpressionType.UNIVERSAL_QUANTIFICATION:
      return {
        type: ExpressionType.EXISTENTIAL_QUANTIFICATION,
        variable: expression.variable,
        formula: negate(expression.formula)
      }

    case ExpressionType.EXISTENTIAL_QUANTIFICATION:
      return {
        type: ExpressionType.UNIVERSAL_QUANTIFICATION,
        variable: expression.variable,
        formula: negate(expression.formula)
      }

    // de Morgan's laws
    case ExpressionType.CONJUNCTION:
      return {
        type: ExpressionType.DISJUNCTION,
        formulas: expression.formulas.map(negate)
      }

    case ExpressionType.DISJUNCTION:
      return {
        type: ExpressionType.CONJUNCTION,
        formulas: expression.formulas.map(negate)
      }
  }
}

function mostlyConvertToCNF (expression) {
  switch (expression.type) {
    case ExpressionType.PREDICATE:
      return expression

    case ExpressionType.NEGATION:
      return negate(simplify(expression.formula))

    case ExpressionType.UNIVERSAL_QUANTIFICATION:
    case ExpressionType.EXISTENTIAL_QUANTIFICATION:
      return {
        type: expression.type,
        variable: expression.variable,
        formula: simplify(expression.formula)
      }

    case ExpressionType.CONJUNCTION:
    case ExpressionType.DISJUNCTION:
      const subformulas = expression.formulas.map(simplify)
      const flattened = []

      for (const subf of subformulas) {
        if (subf.type === expression.type) {
          flattened.push(...subf.formulas.map(simplify))
        } else {
          flattened.push(subf)
        }
      }

      return {
        type: expression.type,
        formulas: flattened
      }

    // P → Q ≡ ¬P ∨ Q
    case ExpressionType.IMPLICATION:
      const [a, b] = expression.formulas.map(simplify)

      return simplify({
        type: ExpressionType.DISJUNCTION,
        formulas: [negate(a), b]
      })

    // P ↔ Q ≡ (¬P ∨ Q) & (P ∨ ¬Q)
    case ExpressionType.EQUIVALENCE:
      const [c, d] = expression.formulas.map(simplify)

      return simplify({
        type: ExpressionType.CONJUNCTION,
        formulas: [
          {
            type: ExpressionType.DISJUNCTION,
            formulas: [negate(c), d]
          },
          {
            type: ExpressionType.DISJUNCTION,
            formulas: [c, negate(d)]
          }
        ]
      })
  }
}

export function simplify (expression) {
  const cnf = mostlyConvertToCNF(expression)

  if (cnf.type !== ExpressionType.DISJUNCTION) {
    return cnf
  }

  const subformulas = cnf.formulas

  for (let i = 0; i < subformulas.length; i++) {
    const subf = subformulas[i]

    if (subf.type === ExpressionType.CONJUNCTION) {
      const before = subformulas.slice(0, i)
      const after = subformulas.slice(i + 1)

      return {
        type: ExpressionType.CONJUNCTION,
        formulas: subf.formulas.map(ssubf => ({
          type: ExpressionType.DISJUNCTION,
          formulas: before.concat([simplify(ssubf)]).concat(after)
        }))
      }
    }
  }

  return cnf
}
