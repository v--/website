import TermType from '../enums/term_type.mjs'
import FormulaType from '../enums/formula_type.mjs'
import { negate } from '../logic/support.mjs'

function replaceVariables (term, replacementMap) {
  switch (term.type) {
    case TermType.CONSTANT:
      return term

    case TermType.VARIABLE:
      return replacementMap.get(term.name) || term

    case TermType.FUNCTION:
      return {
        type: term.type,
        name: term.name,
        args: term.args.map(arg => replaceVariables(arg, replacementMap))
      }
  }
}

export function convertToSNF (formula, replacementMap = new Map(), univVarNames = []) {
  switch (formula.type) {
    case FormulaType.PREDICATE:
      return {
        type: formula.type,
        name: formula.name,
        args: formula.args.map(function (term) {
          return replaceVariables(term, replacementMap)
        })
      }

    case FormulaType.UNIVERSAL_QUANTIFICATION:
      return convertToSNF(formula.formula, replacementMap, univVarNames.concat([formula.variable]))

    case FormulaType.EXISTENTIAL_QUANTIFICATION:
      const counterName = univVarNames.length === 0 ? 'constCounter' : 'funcCounter'
      const counter = replacementMap.get(counterName) || 1
      replacementMap.set(counterName, counter + 1)
      let replacement

      if (univVarNames.length === 0) {
        replacement = {
          type: TermType.VARIABLE,
          name: 'd' + counter
        }
      } else {
        replacement = {
          type: TermType.FUNCTION,
          name: 'u' + counter,
          args: univVarNames.map(function (varName) {
            return { type: TermType.VARIABLE, name: varName }
          })
        }
      }

      replacementMap.set(formula.variable, replacement)
      return convertToSNF(formula.formula, replacementMap, univVarNames)

    case FormulaType.NEGATION:
      return negate(convertToSNF(formula.formula, replacementMap, univVarNames))

    case FormulaType.CONJUNCTION:
    case FormulaType.DISJUNCTION:
      return {
        type: formula.type,
        formulas: formula.formulas.map(f => convertToSNF(f, replacementMap, univVarNames))
      }
  }
}
