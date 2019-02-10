import TermType from '../enums/term_type.mjs'
import FormulaType from '../enums/formula_type.mjs'
import { negate } from './support.mjs'

function renameVariables (term, nameMap) {
  switch (term.type) {
    case TermType.CONSTANT:
      return term

    case TermType.VARIABLE:
      return {
        type: term.type,
        name: nameMap.get(term.name) || term.name
      }

    case TermType.FUNCTION:
      return {
        type: term.type,
        name: term.name,
        args: term.args.map(arg => renameVariables(arg, nameMap))
      }
  }
}

export function convertToPNF (formula, nameMap = new Map()) {
  switch (formula.type) {
    case FormulaType.PREDICATE:
      return {
        type: formula.type,
        name: formula.name,
        args: formula.args.map(arg => renameVariables(arg, nameMap))
      }

    case FormulaType.UNIVERSAL_QUANTIFICATION:
    case FormulaType.EXISTENTIAL_QUANTIFICATION:
      const counter = nameMap.get('counter') || 1
      nameMap.set('counter', counter + 1)
      const newVarName = 't' + counter
      const oldVariable = nameMap.get(formula.variable)
      nameMap.set(formula.variable, newVarName)
      const newSubformula = convertToPNF(formula.formula, nameMap)

      if (oldVariable) {
        nameMap.set(formula.variable, oldVariable)
      } else {
        nameMap.delete(formula.variable)
      }

      return {
        type: formula.type,
        variable: newVarName,
        formula: newSubformula
      }

    case FormulaType.NEGATION:
      return negate(convertToPNF(formula.formula, nameMap))

    case FormulaType.CONJUNCTION:
    case FormulaType.DISJUNCTION:
      // Split the prefix and the inner formula
      const combinedPrefix = []
      const inner = {
        type: formula.type,
        formulas: []
      }

      for (const subf of formula.formulas) {
        const newSubf = convertToPNF(subf, nameMap)
        const ssubfs = [newSubf]

        for (const ssubf of ssubfs) {
          if (ssubf.type === FormulaType.UNIVERSAL_QUANTIFICATION || ssubf.type === FormulaType.EXISTENTIAL_QUANTIFICATION) {
            combinedPrefix.push({
              type: ssubf.type,
              variable: ssubf.variable
            })

            ssubfs.push(ssubf.formula)
          } else {
            inner.formulas.push(ssubf)
          }
        }
      }

      // Recombine the prefix with the inner formula
      let current = inner

      for (const pref of combinedPrefix.reverse()) {
        current = Object.assign({ formula: current }, pref)
      }

      return current
  }
}
