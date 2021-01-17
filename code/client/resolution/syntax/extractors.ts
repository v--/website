import { sort, uniqueBy, union, flatten } from '../../../common/support/iteration.js'
import { stringifyExpression, stringifyDisjunct } from '../support/stringify.js'

export function extractDisjuncts(expression: Resolution.SNFFormula): Resolution.FOLDisjunct[] {
  switch (expression.type) {
    case 'predicate':
    case 'negation':
      return [[expression as Resolution.FOLLiteral]]

    case 'conjunction':
      return Array.from(uniqueBy(expression.formulas.map(subformula => {
        switch (subformula.type) {
          case 'predicate':
          case 'negation':
            return [subformula as Resolution.FOLLiteral]

          case 'disjunction':
            return Array.from(uniqueBy(subformula.formulas as Resolution.FOLDisjunct, stringifyExpression))
        }
      }), stringifyDisjunct))

    case 'disjunction':
      return [Array.from(uniqueBy(expression.formulas as Resolution.FOLDisjunct, stringifyExpression))]

    case 'universalQuantification':
      return extractDisjuncts(expression.formula)
  }
}

function extractPredicatesImpl(expression: Resolution.FOLFormula): Set<string> {
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

export function extractPredicates(expression: Resolution.FOLFormula) {
  return Array.from(extractPredicatesImpl(expression)).map(function(pred) {
    const [name, arityString] = pred.split('#')
    return {
      name, arity: Number(arityString)
    }
  })
}

export function extractFunctionsImpl(expression: Resolution.FOLExpression): Set<string> {
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

export function extractFunctions(expression: Resolution.FOLExpression) {
  return Array.from(extractFunctionsImpl(expression)).map(function(func) {
    const [name, arityString] = func.split('#')
    return {
      name, arity: Number(arityString)
    }
  })
}

export function extractVariablesImpl(expression: Resolution.FOLExpression): Set<string> {
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

export function extractVariables(expression: Resolution.FOLExpression) {
  return Array.from(extractVariablesImpl(expression))
}

export function extractBoundVariables(expression: Resolution.FOLExpression): string[] {
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

export function extractFreeVariables(expression: Resolution.FOLExpression): string[] {
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
