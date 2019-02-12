import { union, flatten } from '../../../common/support/iteration.mjs'
import TermType from '../enums/term_type.mjs'
import FormulaType from '../enums/formula_type.mjs'

export function extractDisjuncts (formula) {
  switch (formula.type) {
    case FormulaType.PREDICATE:
    case FormulaType.NEGATION:
      return [[formula]]

    case FormulaType.CONJUNCTION:
      return formula.formulas.map(function (subformula) {
        switch (subformula.type) {
          case FormulaType.PREDICATE:
          case FormulaType.NEGATION:
            return [subformula]

          case FormulaType.DISJUNCTION:
            return subformula.formulas
        }
      })

    case FormulaType.DISJUNCTION:
      return [formula.formulas]
  }
}

function extractPredicatesImpl (formula) {
  switch (formula.type) {
    case FormulaType.PREDICATE:
      return new Set([`${formula.name}#${formula.args.length}`])

    case FormulaType.NEGATION:
    case FormulaType.UNIVERSAL_QUANTIFICATION:
    case FormulaType.EXISTENTIAL_QUANTIFICATION:
      return extractPredicatesImpl(formula.formula)

    case FormulaType.CONJUNCTION:
    case FormulaType.DISJUNCTION:
    case FormulaType.IMPLICATION:
    case FormulaType.EQUIVALENCE:
      return union(...formula.formulas.map(extractPredicatesImpl))
  }
}

export function extractPredicates (formula) {
  return Array.from(extractPredicatesImpl(formula)).map(function (pred) {
    const [name, arityString] = pred.split('#')
    return {
      name, arity: Number(arityString)
    }
  })
}

export function extractFunctionsImpl (formula) {
  switch (formula.type) {
    case TermType.VARIABLE:
      return new Set()

    case TermType.FUNCTION:
      return union([
        `${formula.name}#${formula.args.length}`
      ], ...formula.args.map(extractFunctionsImpl))

    case FormulaType.PREDICATE:
      return union(...formula.args.map(extractFunctionsImpl))

    case FormulaType.NEGATION:
    case FormulaType.UNIVERSAL_QUANTIFICATION:
    case FormulaType.EXISTENTIAL_QUANTIFICATION:
      return extractFunctionsImpl(formula.formula)

    case FormulaType.CONJUNCTION:
    case FormulaType.DISJUNCTION:
    case FormulaType.IMPLICATION:
    case FormulaType.EQUIVALENCE:
      return union(...formula.formulas.map(extractFunctionsImpl))
  }
}

export function extractFunctions (formula) {
  return Array.from(extractFunctionsImpl(formula)).map(function (func) {
    const [name, arityString] = func.split('#')
    return {
      name, arity: Number(arityString)
    }
  })
}

export function extractVariablesImpl (formula) {
  switch (formula.type) {
    case TermType.VARIABLE:
      return new Set([formula.name])

    case TermType.FUNCTION:
    case FormulaType.PREDICATE:
      return union(...formula.args.map(extractVariablesImpl))

    case FormulaType.NEGATION:
    case FormulaType.UNIVERSAL_QUANTIFICATION:
    case FormulaType.EXISTENTIAL_QUANTIFICATION:
      return extractVariablesImpl(formula.formula)

    case FormulaType.CONJUNCTION:
    case FormulaType.DISJUNCTION:
    case FormulaType.IMPLICATION:
    case FormulaType.EQUIVALENCE:
      return union(...formula.formulas.map(extractVariablesImpl))
  }
}

export function extractVariables (formula) {
  return Array.from(extractVariablesImpl(formula))
}

export function extractBoundVariables (formula) {
  switch (formula.type) {
    case TermType.VARIABLE:
      return []

    case TermType.FUNCTION:
    case FormulaType.PREDICATE:
      return Array.from(flatten(formula.args.map(extractBoundVariables)))

    case FormulaType.NEGATION:
      return extractBoundVariables(formula.formula)

    case FormulaType.UNIVERSAL_QUANTIFICATION:
    case FormulaType.EXISTENTIAL_QUANTIFICATION:
      return [formula.variable].concat(extractBoundVariables(formula.formula))

    case FormulaType.CONJUNCTION:
    case FormulaType.DISJUNCTION:
    case FormulaType.IMPLICATION:
    case FormulaType.EQUIVALENCE:
      return Array.from(flatten(formula.formulas.map(extractBoundVariables)))
  }
}
