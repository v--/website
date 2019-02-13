import TermType from '../enums/term_type.mjs'
import FormulaType from '../enums/formula_type.mjs'
import { replaceVariables } from './replacement.mjs'
import { extractFreeVariables } from './extractors.mjs'
import { convertToCNF } from './cnf.mjs'

export function mostlyConvertToPNF (formula, counter, replacementMap) {
  switch (formula.type) {
    case FormulaType.PREDICATE:
      return {
        type: formula.type,
        name: formula.name,
        args: formula.args.map(arg => replaceVariables(arg, replacementMap))
      }

    case FormulaType.UNIVERSAL_QUANTIFICATION:
    case FormulaType.EXISTENTIAL_QUANTIFICATION:
      const oldReplacement = replacementMap.get(formula.variable)
      const newVarName = oldReplacement ? 't' + counter.value++ : formula.variable
      replacementMap.set(formula.variable, { type: TermType.VARIABLE, name: newVarName })
      const newSubformula = mostlyConvertToPNF(formula.formula, counter, replacementMap)

      if (oldReplacement) {
        replacementMap.set(formula.variable, oldReplacement)
      }

      return {
        type: formula.type,
        variable: newVarName,
        formula: newSubformula
      }

    case FormulaType.NEGATION:
      return {
        type: formula.type,
        formula: mostlyConvertToPNF(formula.formula, counter, replacementMap)
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
        const newSubf = mostlyConvertToPNF(subf, counter, replacementMap)
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

export function convertToPNF (formula, counter = { value: 1 }, replacementMap = new Map()) {
  for (const variable of extractFreeVariables(formula)) {
    replacementMap.set(variable, { type: TermType.VARIABLE, name: variable })
  }

  return convertToCNF(mostlyConvertToPNF(formula, counter, replacementMap))
}
