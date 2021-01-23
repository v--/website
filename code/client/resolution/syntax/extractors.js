import { sort, uniqueBy, union, flatten } from '../../../common/support/iteration.js'
import { stringifyExpression, stringifyDisjunct } from '../support/stringify.js'

/**
 * @param {TResolution.SNFFormula} expression
 * @returns {TResolution.Disjunct[]}
 */
export function extractDisjuncts(expression) {
  switch (expression.type) {
    case 'predicate':
    case 'negation':
      return [[/** @type {TResolution.Literal} */ (expression)]]

    case 'conjunction':
      return Array.from(uniqueBy(expression.formulas.map(subformula => {
        switch (subformula.type) {
          case 'predicate':
          case 'negation':
            return [/** @type {TResolution.Literal} */ (subformula)]

          case 'disjunction':
            return Array.from(uniqueBy(/** @type {TResolution.Disjunct} */ (subformula.formulas), stringifyExpression))
        }
      }), stringifyDisjunct))

    case 'disjunction':
      return [Array.from(uniqueBy(/** @type {TResolution.Disjunct} */ (expression.formulas), stringifyExpression))]

    case 'universalQuantification':
      return extractDisjuncts(expression.formula)
  }
}

/**
 * @param {TResolution.Formula} expression
 * @returns {Set<string>}
 */
function extractPredicatesImpl(expression) {
  switch (expression.type) {
    case 'predicate':
      return new Set([`${expression.name}#${expression.args.length}`])

    case 'negation':
    case 'universalQuantification':
    case 'existentialQuantification':
      return extractPredicatesImpl(expression.formula)

    case 'conjunction':
    case 'disjunction':
    case 'implication':
    case 'equivalence':
      return union(...expression.formulas.map(extractPredicatesImpl))
  }
}

/**
 * @param {TResolution.Formula} expression
 */
export function extractPredicates(expression) {
  return Array.from(extractPredicatesImpl(expression)).map(function(pred) {
    const [name, arityString] = pred.split('#')
    return {
      name, arity: Number(arityString)
    }
  })
}

/**
 * @param {TResolution.Expression} expression
 * @returns {Set<string>}
 */
export function extractFunctionsImpl(expression) {
  switch (expression.type) {
    case 'variable':
      return new Set()

    case 'function':
      return union([
        `${expression.name}#${expression.args.length}`
      ], ...expression.args.map(extractFunctionsImpl))

    case 'predicate':
      return union(...expression.args.map(extractFunctionsImpl))

    case 'negation':
    case 'universalQuantification':
    case 'existentialQuantification':
      return extractFunctionsImpl(expression.formula)

    case 'conjunction':
    case 'disjunction':
    case 'implication':
    case 'equivalence':
      return union(...expression.formulas.map(extractFunctionsImpl))
  }
}

/**
 * @param {TResolution.Formula} expression
 */
export function extractFunctions(expression) {
  return Array.from(extractFunctionsImpl(expression)).map(function(func) {
    const [name, arityString] = func.split('#')
    return {
      name, arity: Number(arityString)
    }
  })
}

/**
 * @param {TResolution.Expression} expression
 * @returns {Set<string>}
 */
export function extractVariablesImpl(expression) {
  switch (expression.type) {
    case 'variable':
      return new Set([expression.name])

    case 'function':
    case 'predicate':
      return union(...expression.args.map(extractVariablesImpl))

    case 'negation':
    case 'universalQuantification':
    case 'existentialQuantification':
      return extractVariablesImpl(expression.formula)

    case 'conjunction':
    case 'disjunction':
    case 'implication':
    case 'equivalence':
      return union(...expression.formulas.map(extractVariablesImpl))
  }
}

/**
 * @param {TResolution.SNFFormula} expression
 */
export function extractVariables(expression) {
  return Array.from(extractVariablesImpl(expression))
}

/**
 * @param {TResolution.Expression} expression
 * @returns {string[]}
 */
export function extractBoundVariables(expression) {
  switch (expression.type) {
    case 'variable':
      return []

    case 'function':
    case 'predicate':
      return Array.from(flatten(expression.args.map(extractBoundVariables)))

    case 'negation':
      return extractBoundVariables(expression.formula)

    case 'universalQuantification':
    case 'existentialQuantification':
      return [expression.variable].concat(extractBoundVariables(expression.formula))

    case 'conjunction':
    case 'disjunction':
    case 'implication':
    case 'equivalence':
      return Array.from(flatten(expression.formulas.map(extractBoundVariables)))
  }
}

/**
 * @param {TResolution.Expression} expression
 * @returns {string[]}
 */
export function extractFreeVariables(expression) {
  switch (expression.type) {
    case 'variable':
      return [expression.name]

    case 'function':
    case 'predicate':
      return sort(uniqueBy(flatten(expression.args.map(extractFreeVariables))))

    case 'negation':
      return extractFreeVariables(expression.formula)

    case 'universalQuantification':
    case 'existentialQuantification':
      return sort(uniqueBy(extractFreeVariables(expression.formula))).filter(v => v !== expression.variable)

    case 'conjunction':
    case 'disjunction':
    case 'implication':
    case 'equivalence':
      return sort(uniqueBy(flatten(expression.formulas.map(extractFreeVariables))))
  }
}
