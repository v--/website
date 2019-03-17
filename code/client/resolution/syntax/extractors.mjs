import { sort, unique, union, flatten } from '../../../common/support/iteration.mjs'
import ExpressionType from '../enums/expression_type.mjs'

export function extractDisjuncts (expression) {
  switch (expression.type) {
    case ExpressionType.PREDICATE:
    case ExpressionType.NEGATION:
      return [[expression]]

    case ExpressionType.CONJUNCTION:
      return expression.formulas.map(function (subformula) {
        switch (subformula.type) {
          case ExpressionType.PREDICATE:
          case ExpressionType.NEGATION:
            return [subformula]

          case ExpressionType.DISJUNCTION:
            return subformula.formulas
        }
      })

    case ExpressionType.DISJUNCTION:
      return [expression.formulas]

    case ExpressionType.UNIVERSAL_QUANTIFICATION:
      return extractDisjuncts(expression.formula)
  }
}

function extractPredicatesImpl (expression) {
  switch (expression.type) {
    case ExpressionType.PREDICATE:
      return new Set([`${expression.name}#${expression.args.length}`])

    case ExpressionType.NEGATION:
    case ExpressionType.UNIVERSAL_QUANTIFICATION:
    case ExpressionType.EXISTENTIAL_QUANTIFICATION:
      return extractPredicatesImpl(expression.formula)

    case ExpressionType.CONJUNCTION:
    case ExpressionType.DISJUNCTION:
    case ExpressionType.IMPLICATION:
    case ExpressionType.EQUIVALENCE:
      return union(...expression.formulas.map(extractPredicatesImpl))
  }
}

export function extractPredicates (expression) {
  return Array.from(extractPredicatesImpl(expression)).map(function (pred) {
    const [name, arityString] = pred.split('#')
    return {
      name, arity: Number(arityString)
    }
  })
}

export function extractFunctionsImpl (expression) {
  switch (expression.type) {
    case ExpressionType.VARIABLE:
      return new Set()

    case ExpressionType.FUNCTION:
      return union([
        `${expression.name}#${expression.args.length}`
      ], ...expression.args.map(extractFunctionsImpl))

    case ExpressionType.PREDICATE:
      return union(...expression.args.map(extractFunctionsImpl))

    case ExpressionType.NEGATION:
    case ExpressionType.UNIVERSAL_QUANTIFICATION:
    case ExpressionType.EXISTENTIAL_QUANTIFICATION:
      return extractFunctionsImpl(expression.formula)

    case ExpressionType.CONJUNCTION:
    case ExpressionType.DISJUNCTION:
    case ExpressionType.IMPLICATION:
    case ExpressionType.EQUIVALENCE:
      return union(...expression.formulas.map(extractFunctionsImpl))
  }
}

export function extractFunctions (expression) {
  return Array.from(extractFunctionsImpl(expression)).map(function (func) {
    const [name, arityString] = func.split('#')
    return {
      name, arity: Number(arityString)
    }
  })
}

export function extractVariablesImpl (expression) {
  switch (expression.type) {
    case ExpressionType.VARIABLE:
      return new Set([expression.name])

    case ExpressionType.FUNCTION:
    case ExpressionType.PREDICATE:
      return union(...expression.args.map(extractVariablesImpl))

    case ExpressionType.NEGATION:
    case ExpressionType.UNIVERSAL_QUANTIFICATION:
    case ExpressionType.EXISTENTIAL_QUANTIFICATION:
      return extractVariablesImpl(expression.formula)

    case ExpressionType.CONJUNCTION:
    case ExpressionType.DISJUNCTION:
    case ExpressionType.IMPLICATION:
    case ExpressionType.EQUIVALENCE:
      return union(...expression.formulas.map(extractVariablesImpl))
  }
}

export function extractVariables (expression) {
  return Array.from(extractVariablesImpl(expression))
}

export function extractBoundVariables (expression) {
  switch (expression.type) {
    case ExpressionType.VARIABLE:
      return []

    case ExpressionType.FUNCTION:
    case ExpressionType.PREDICATE:
      return Array.from(flatten(expression.args.map(extractBoundVariables)))

    case ExpressionType.NEGATION:
      return extractBoundVariables(expression.formula)

    case ExpressionType.UNIVERSAL_QUANTIFICATION:
    case ExpressionType.EXISTENTIAL_QUANTIFICATION:
      return [expression.variable].concat(extractBoundVariables(expression.formula))

    case ExpressionType.CONJUNCTION:
    case ExpressionType.DISJUNCTION:
    case ExpressionType.IMPLICATION:
    case ExpressionType.EQUIVALENCE:
      return Array.from(flatten(expression.formulas.map(extractBoundVariables)))
  }
}

export function extractFreeVariables (expression) {
  switch (expression.type) {
    case ExpressionType.VARIABLE:
      return [expression.name]

    case ExpressionType.FUNCTION:
    case ExpressionType.PREDICATE:
      return sort(unique(flatten(expression.args.map(extractFreeVariables))))

    case ExpressionType.NEGATION:
      return extractFreeVariables(expression.formula)

    case ExpressionType.UNIVERSAL_QUANTIFICATION:
    case ExpressionType.EXISTENTIAL_QUANTIFICATION:
      return sort(unique(extractFreeVariables(expression.formula))).filter(v => v !== expression.variable)

    case ExpressionType.CONJUNCTION:
    case ExpressionType.DISJUNCTION:
    case ExpressionType.IMPLICATION:
    case ExpressionType.EQUIVALENCE:
      return sort(unique(flatten(expression.formulas.map(extractFreeVariables))))
  }
}
