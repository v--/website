import TermType from '../enums/term_type.mjs'
import FormulaType from '../enums/formula_type.mjs'
import { replaceVariables } from './replacement.mjs'
import { convertToCNF } from './cnf.mjs'

export function mostlyConvertToPNF (formula, counter = { value: 1 }, nameMap = new Map()) {
  switch (formula.type) {
    case FormulaType.PREDICATE:
      return {
        type: formula.type,
        name: formula.name,
        args: formula.args.map(arg => replaceVariables(arg, nameMap))
      }

    case FormulaType.UNIVERSAL_QUANTIFICATION:
    case FormulaType.EXISTENTIAL_QUANTIFICATION:
      const newVarName = 't' + counter.value++
      const oldVariable = nameMap.get(formula.variable)
      nameMap.set(formula.variable, { type: TermType.VARIABLE, name: newVarName })
      const newSubformula = mostlyConvertToPNF(formula.formula, counter, nameMap)

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
      return {
        type: formula.type,
        formula: mostlyConvertToPNF(formula.formula, counter, nameMap)
      }

    case FormulaType.CONJUNCTION:
    case FormulaType.DISJUNCTION:
      // Split the prefix and the inner formula
      const combinedPrefix = []
      const inner = {
        type: formula.type,
        formulas: []
      }

      for (const subf of formula.formulas) {
        const newSubf = mostlyConvertToPNF(subf, counter, nameMap)
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

export function convertToPNF (formula, counter, nameMap) {
  return convertToCNF(mostlyConvertToPNF(formula, counter, nameMap))
}
