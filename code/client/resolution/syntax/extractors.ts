import { sort, uniqueBy, union, flatten } from '../../../common/support/iteration.js'
import { stringifyExpression, stringifyDisjunct } from '../support/stringify.js'

export function extractDisjuncts(expression: TResolution.SNFFormula): TResolution.FOLDisjunct[] {
  switch (expression.type) {
    case 'predicate':
    case 'negation':
      return [[expression as TResolution.FOLLiteral]]

    case 'conjunction':
      return Array.from(uniqueBy(expression.formulas.map(subformula => {
        switch (subformula.type) {
          case 'predicate':
          case 'negation':
            return [subformula as TResolution.FOLLiteral]

          case 'disjunction':
            return Array.from(uniqueBy(subformula.formulas as TResolution.FOLDisjunct, stringifyExpression))
        }
      }), stringifyDisjunct))

    case 'disjunction':
      return [Array.from(uniqueBy(expression.formulas as TResolution.FOLDisjunct, stringifyExpression))]

    case 'universalQuantification':
      return extractDisjuncts(expression.formula)
  }
}

function extractPredicatesImpl(expression: TResolution.FOLFormula): Set<string> {
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

export function extractPredicates(expression: TResolution.FOLFormula) {
  return Array.from(extractPredicatesImpl(expression)).map(function(pred) {
    const [name, arityString] = pred.split('#')
    return {
      name, arity: Number(arityString)
    }
  })
}

export function extractFunctionsImpl(expression: TResolution.FOLExpression): Set<string> {
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

export function extractFunctions(expression: TResolution.FOLExpression) {
  return Array.from(extractFunctionsImpl(expression)).map(function(func) {
    const [name, arityString] = func.split('#')
    return {
      name, arity: Number(arityString)
    }
  })
}

export function extractVariablesImpl(expression: TResolution.FOLExpression): Set<string> {
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

export function extractVariables(expression: TResolution.FOLExpression) {
  return Array.from(extractVariablesImpl(expression))
}

export function extractBoundVariables(expression: TResolution.FOLExpression): string[] {
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

export function extractFreeVariables(expression: TResolution.FOLExpression): string[] {
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
