import { ExpressionType } from '../enums/expression_type.js'
import { replaceVariables } from './replacement.js'
import { extractFreeVariables } from './extractors.js'
import { simplify } from './simplification.js'

export function mostlyConvertToPNF (expression, counter, replacementMap) {
  switch (expression.type) {
    case ExpressionType.PREDICATE:
      return {
        type: expression.type,
        name: expression.name,
        args: expression.args.map(arg => replaceVariables(arg, replacementMap))
      }

    case ExpressionType.UNIVERSAL_QUANTIFICATION:
    case ExpressionType.EXISTENTIAL_QUANTIFICATION:
      const oldReplacement = replacementMap.get(expression.variable)
      const newVarName = oldReplacement ? 't' + counter.value++ : expression.variable
      replacementMap.set(expression.variable, { type: ExpressionType.VARIABLE, name: newVarName })
      const newSubformula = mostlyConvertToPNF(expression.formula, counter, replacementMap)

      if (oldReplacement) {
        replacementMap.set(expression.variable, oldReplacement)
      }

      return {
        type: expression.type,
        variable: newVarName,
        formula: newSubformula
      }

    case ExpressionType.NEGATION:
      return {
        type: expression.type,
        formula: mostlyConvertToPNF(expression.formula, counter, replacementMap)
      }

    case ExpressionType.CONJUNCTION:
    case ExpressionType.DISJUNCTION:
      // Split the prefix and the inner expression
      const combinedPrefix = []
      const inner = {
        type: expression.type,
        formulas: []
      }

      for (const subf of expression.formulas) {
        const newSubf = mostlyConvertToPNF(subf, counter, replacementMap)
        const ssubfs = [newSubf]

        for (const ssubf of ssubfs) {
          if (ssubf.type === ExpressionType.UNIVERSAL_QUANTIFICATION || ssubf.type === ExpressionType.EXISTENTIAL_QUANTIFICATION) {
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

      // Recombine the prefix with the inner expression
      let current = inner

      for (const pref of combinedPrefix.reverse()) {
        current = Object.assign({ formula: current }, pref)
      }

      return current
  }
}

export function convertToPNF (expression, counter = { value: 1 }, replacementMap = new Map()) {
  for (const variable of extractFreeVariables(expression)) {
    replacementMap.set(variable, { type: ExpressionType.VARIABLE, name: variable })
  }

  return simplify(mostlyConvertToPNF(expression, counter, replacementMap))
}
