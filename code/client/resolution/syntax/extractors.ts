import { sort, uniqueBy, union, flatten } from '../../../common/support/iteration.js'
import { ExpressionType } from '../enums/expression_type.js'
import { stringifyExpression, stringifyDisjunct } from '../support/stringify.js'
import { FOLDisjunct, FOLExpression, FOLFormula, FOLLiteral, SNFFormula } from '../types/expression.js'

export function extractDisjuncts(expression: SNFFormula): FOLDisjunct[] {
  switch (expression.type) {
    case ExpressionType.predicate:
    case ExpressionType.negation:
      return [[expression as FOLLiteral]]

    case ExpressionType.conjunction:
      return Array.from(uniqueBy(expression.formulas.map(subformula => {
        switch (subformula.type) {
          case ExpressionType.predicate:
          case ExpressionType.negation:
            return [subformula as FOLLiteral]

          case ExpressionType.disjunction:
            return Array.from(uniqueBy(subformula.formulas as FOLDisjunct, stringifyExpression))
        }
      }), stringifyDisjunct))

    case ExpressionType.disjunction:
      return [Array.from(uniqueBy(expression.formulas as FOLDisjunct, stringifyExpression))]

    case ExpressionType.universalQuantification:
      return extractDisjuncts(expression.formula)
  }
}

function extractPredicatesImpl(expression: FOLFormula): Set<string> {
  switch (expression.type) {
    case ExpressionType.predicate:
      return new Set([`${expression.name}#${expression.args.length}`])

    case ExpressionType.negation:
    case ExpressionType.universalQuantification:
    case ExpressionType.existentialQuantification:
      return extractPredicatesImpl(expression.formula)

    case ExpressionType.conjunction:
    case ExpressionType.disjunction:
    case ExpressionType.implication:
    case ExpressionType.equivalence:
      return union(...expression.formulas.map(extractPredicatesImpl))
  }
}

export function extractPredicates(expression: FOLFormula) {
  return Array.from(extractPredicatesImpl(expression)).map(function(pred) {
    const [name, arityString] = pred.split('#')
    return {
      name, arity: Number(arityString)
    }
  })
}

export function extractFunctionsImpl(expression: FOLExpression): Set<string> {
  switch (expression.type) {
    case ExpressionType.variable:
      return new Set()

    case ExpressionType.function:
      return union([
        `${expression.name}#${expression.args.length}`
      ], ...expression.args.map(extractFunctionsImpl))

    case ExpressionType.predicate:
      return union(...expression.args.map(extractFunctionsImpl))

    case ExpressionType.negation:
    case ExpressionType.universalQuantification:
    case ExpressionType.existentialQuantification:
      return extractFunctionsImpl(expression.formula)

    case ExpressionType.conjunction:
    case ExpressionType.disjunction:
    case ExpressionType.implication:
    case ExpressionType.equivalence:
      return union(...expression.formulas.map(extractFunctionsImpl))
  }
}

export function extractFunctions(expression: FOLExpression) {
  return Array.from(extractFunctionsImpl(expression)).map(function(func) {
    const [name, arityString] = func.split('#')
    return {
      name, arity: Number(arityString)
    }
  })
}

export function extractVariablesImpl(expression: FOLExpression): Set<string> {
  switch (expression.type) {
    case ExpressionType.variable:
      return new Set([expression.name])

    case ExpressionType.function:
    case ExpressionType.predicate:
      return union(...expression.args.map(extractVariablesImpl))

    case ExpressionType.negation:
    case ExpressionType.universalQuantification:
    case ExpressionType.existentialQuantification:
      return extractVariablesImpl(expression.formula)

    case ExpressionType.conjunction:
    case ExpressionType.disjunction:
    case ExpressionType.implication:
    case ExpressionType.equivalence:
      return union(...expression.formulas.map(extractVariablesImpl))
  }
}

export function extractVariables(expression: FOLExpression) {
  return Array.from(extractVariablesImpl(expression))
}

export function extractBoundVariables(expression: FOLExpression): string[] {
  switch (expression.type) {
    case ExpressionType.variable:
      return []

    case ExpressionType.function:
    case ExpressionType.predicate:
      return Array.from(flatten(expression.args.map(extractBoundVariables)))

    case ExpressionType.negation:
      return extractBoundVariables(expression.formula)

    case ExpressionType.universalQuantification:
    case ExpressionType.existentialQuantification:
      return [expression.variable].concat(extractBoundVariables(expression.formula))

    case ExpressionType.conjunction:
    case ExpressionType.disjunction:
    case ExpressionType.implication:
    case ExpressionType.equivalence:
      return Array.from(flatten(expression.formulas.map(extractBoundVariables)))
  }
}

export function extractFreeVariables(expression: FOLExpression): string[] {
  switch (expression.type) {
    case ExpressionType.variable:
      return [expression.name]

    case ExpressionType.function:
    case ExpressionType.predicate:
      return sort(uniqueBy(flatten(expression.args.map(extractFreeVariables))))

    case ExpressionType.negation:
      return extractFreeVariables(expression.formula)

    case ExpressionType.universalQuantification:
    case ExpressionType.existentialQuantification:
      return sort(uniqueBy(extractFreeVariables(expression.formula))).filter(v => v !== expression.variable)

    case ExpressionType.conjunction:
    case ExpressionType.disjunction:
    case ExpressionType.implication:
    case ExpressionType.equivalence:
      return sort(uniqueBy(flatten(expression.formulas.map(extractFreeVariables))))
  }
}
