/**
 * @param {TResolution.Formula} expression
 * @returns {TResolution.Formula}
 */
export function negate(expression) {
  switch (expression.type) {
    case 'negation':
      return expression.formula

    case 'predicate':
      return {
        type: 'negation',
        formula: expression
      }

    // Quantifier inversion rules
    case 'universalQuantification':
      return {
        type: 'existentialQuantification',
        variable: expression.variable,
        formula: negate(expression.formula)
      }

    case 'existentialQuantification':
      return {
        type: 'universalQuantification',
        variable: expression.variable,
        formula: negate(expression.formula)
      }

    // de Morgan's laws
    case 'conjunction':
      return {
        type: 'disjunction',
        formulas: expression.formulas.map(negate)
      }

    case 'disjunction':
      return {
        type: 'conjunction',
        formulas: expression.formulas.map(negate)
      }

    case 'implication':
      return {
        type: 'implication',
        formulas: [negate(expression.formulas[1]), negate(expression.formulas[0])]
      }

    case 'equivalence':
      return {
        type: 'equivalence',
        formulas: [negate(expression.formulas[0]), negate(expression.formulas[1])]
      }
  }
}

/**
 * @param {TResolution.Formula} expression
 * @returns {TResolution.Formula}
 */
function mostlyConvertToCNF(expression) {
  switch (expression.type) {
    case 'predicate':
      return expression

    case 'negation':
      return negate(simplify(expression.formula))

    case 'universalQuantification':
    case 'existentialQuantification':
      return {
        type: expression.type,
        variable: expression.variable,
        formula: simplify(expression.formula)
      }

    case 'conjunction':
    case 'disjunction':
    {
      const subformulas = expression.formulas.map(simplify)
      const flattened = []

      for (const subf of subformulas) {
        if (subf.type === expression.type) {
          flattened.push(...(/** @type {TResolution.Formula[]} */ (subf.formulas)).map(simplify))
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
    case 'implication':
    {
      const [a, b] = expression.formulas.map(simplify)

      return simplify({
        type: 'disjunction',
        formulas: [negate(a), b]
      })
    }

    // P ↔ Q ≡ (¬P ∨ Q) & (P ∨ ¬Q)
    case 'equivalence':
    {
      const [c, d] = expression.formulas.map(simplify)

      return simplify({
        type: 'conjunction',
        formulas: [
          {
            type: 'disjunction',
            formulas: [negate(c), d]
          },
          {
            type: 'disjunction',
            formulas: [c, negate(d)]
          }
        ]
      })
    }
  }
}

/**
 * @param {TResolution.Formula} expression
 * @returns {TResolution.SimplifiedFormula}
 */
export function simplify(expression) {
  const cnf = mostlyConvertToCNF(expression)

  if (cnf.type !== 'disjunction') {
    return /** @type {TResolution.SimplifiedFormula} */ (cnf)
  }

  const subformulas = cnf.formulas

  for (let i = 0; i < subformulas.length; i++) {
    const subf = subformulas[i]

    if (subf.type === 'conjunction') {
      const before = /** @type {TResolution.SimplifiedInnerFormula[]} */ (subformulas.slice(0, i))
      const after = /** @type {TResolution.SimplifiedInnerFormula[]} */ (subformulas.slice(i + 1))

      return {
        type: 'conjunction',
        formulas: subf.formulas.map(ssubf => ({
          type: 'disjunction',
          formulas: before.concat([/** @type {TResolution.SimplifiedInnerFormula} */ (simplify(ssubf))]).concat(after)
        }))
      }
    }
  }

  return /** @type {TResolution.SimplifiedFormula} */ (cnf)
}
