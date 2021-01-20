/**
 * @param {TResolution.FOLExpression} expression
 * @returns {string}
 */
export function stringifyExpression(expression) {
  switch (expression.type) {
    case 'variable':
      return expression.name

    case 'function':
    case 'predicate':
      if (expression.args.length > 0) {
        return expression.name + '(' + expression.args.map(stringifyExpression).join(', ') + ')'
      }

      return expression.name

    case 'negation':
      return '¬' + stringifyExpression(expression.formula)

    case 'universalQuantification':
      return '∀' + expression.variable + ' ' + stringifyExpression(expression.formula)

    case 'existentialQuantification':
      return '∃' + expression.variable + ' ' + stringifyExpression(expression.formula)

    case 'conjunction':
      return '(' + expression.formulas.map(stringifyExpression).join(' & ') + ')'

    case 'disjunction':
      return '(' + expression.formulas.map(stringifyExpression).join(' ∨ ') + ')'

    case 'implication':
      return '(' + expression.formulas.map(stringifyExpression).join(' → ') + ')'

    case 'equivalence':
      return '(' + expression.formulas.map(stringifyExpression).join(' ↔ ') + ')'
  }
}

/**
 * @param {TResolution.FOLDisjunct} disjunct
 * @returns {string}
 */
export function stringifyDisjunct(disjunct) {
  return '{' + disjunct.map(stringifyExpression).join(', ') + '}'
}

/**
 * @param {Required<TResolution.FOLResolvent>} resolvent
 * @returns {string}
 */
export function stringifyResolvent(resolvent) {
  return `R(${
    resolvent.r1.index + 1
  }, ${
    resolvent.r2.index + 1
  }, ${
    stringifyExpression(resolvent.literal)
  }) = ${
    stringifyDisjunct(resolvent.disjunct)
  }`
}
