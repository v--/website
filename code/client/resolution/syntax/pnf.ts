import { ExpressionType } from '../enums/expression_type.js'
import { replaceVariables } from './replacement.js'
import { extractFreeVariables } from './extractors.js'
import { simplify } from './simplification.js'
import { FOLTerm, SimplifiedFormula, PNFFormula, ConjunctionExpression, SimplifiedInnerFormula, DisjunctionExpression } from '../types/expression.js'

export function mostlyConvertToPNF(
  expression: SimplifiedFormula,
  counter: { value: uint32 } = { value: 1 },
  replacementMap: Map<string, FOLTerm> = new Map(),
): SimplifiedFormula {
  switch (expression.type) {
    case ExpressionType.predicate:
      return {
        type: expression.type,
        name: expression.name,
        args: expression.args.map(arg => replaceVariables(arg, replacementMap) as FOLTerm)
      }

    case ExpressionType.universalQuantification:
    case ExpressionType.existentialQuantification:
    {
      const oldReplacement = replacementMap.get(expression.variable)
      const newVarName = oldReplacement ? 't' + counter.value++ : expression.variable
      replacementMap.set(expression.variable, { type: ExpressionType.variable, name: newVarName })
      const newSubformula = mostlyConvertToPNF(expression.formula, counter, replacementMap) as SimplifiedInnerFormula

      if (oldReplacement) {
        replacementMap.set(expression.variable, oldReplacement)
      }

      return {
        type: expression.type,
        variable: newVarName,
        formula: newSubformula
      }
    }

    case ExpressionType.negation:
      return {
        type: expression.type,
        formula: mostlyConvertToPNF(expression.formula, counter, replacementMap) as SimplifiedInnerFormula
      }

    case ExpressionType.conjunction:
    case ExpressionType.disjunction:
    {
      // Split the prefix and the inner expression
      const combinedPrefix = []
      const inner: (ConjunctionExpression<SimplifiedFormula> | DisjunctionExpression<SimplifiedInnerFormula>) = {
        type: expression.type,
        formulas: []
      }

      for (const subf of expression.formulas) {
        const newSubf = mostlyConvertToPNF(subf, counter, replacementMap)
        const ssubfs = [newSubf]

        for (const ssubf of ssubfs) {
          if (ssubf.type === ExpressionType.universalQuantification || ssubf.type === ExpressionType.existentialQuantification) {
            combinedPrefix.push({
              type: ssubf.type,
              variable: ssubf.variable
            })

            ssubfs.push(ssubf.formula)
          } else {
            inner.formulas.push(ssubf as SimplifiedInnerFormula)
          }
        }
      }

      // Recombine the prefix with the inner expression
      let current: SimplifiedFormula = inner

      for (const pref of combinedPrefix.reverse()) {
        current = {
          formula: current as SimplifiedInnerFormula,
          ...pref
        }
      }

      return current
    }
  }
}


export function convertToPNF(
  expression: SimplifiedFormula,
  counter: { value: uint32 } = { value: 1 },
  replacementMap: Map<string, FOLTerm> = new Map(),
): PNFFormula {
  for (const variable of extractFreeVariables(expression)) {
    replacementMap.set(variable, { type: ExpressionType.variable, name: variable })
  }

  return simplify(mostlyConvertToPNF(expression, counter, replacementMap)) as PNFFormula
}
