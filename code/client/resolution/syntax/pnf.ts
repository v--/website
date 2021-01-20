import { replaceVariables } from './replacement.js'
import { extractFreeVariables } from './extractors.js'
import { simplify } from './simplification.js'

export function mostlyConvertToPNF(
  expression: TResolution.SimplifiedFormula,
  counter: { value: TNum.UInt32 } = { value: 1 },
  replacementMap: Map<string, TResolution.FOLTerm> = new Map(),
): TResolution.SimplifiedFormula {
  switch (expression.type) {
    case 'predicate':
      return {
        type: expression.type,
        name: expression.name,
        args: expression.args.map(arg => replaceVariables(arg, replacementMap) as TResolution.FOLTerm)
      }

    case 'universalQuantification':
    case 'existentialQuantification':
    {
      const oldReplacement = replacementMap.get(expression.variable)
      const newVarName = oldReplacement ? 't' + counter.value++ : expression.variable
      replacementMap.set(expression.variable, { type: 'variable', name: newVarName })
      const newSubformula = mostlyConvertToPNF(expression.formula, counter, replacementMap) as TResolution.SimplifiedInnerFormula

      if (oldReplacement) {
        replacementMap.set(expression.variable, oldReplacement)
      }

      return {
        type: expression.type,
        variable: newVarName,
        formula: newSubformula
      }
    }

    case 'negation':
      return {
        type: expression.type,
        formula: mostlyConvertToPNF(expression.formula, counter, replacementMap) as TResolution.SimplifiedInnerFormula
      }

    case 'conjunction':
    case 'disjunction':
    {
      // Split the prefix and the inner expression
      const combinedPrefix = []
      const inner: (TResolution.ConjunctionExpression<TResolution.SimplifiedFormula> | TResolution.DisjunctionExpression<TResolution.SimplifiedInnerFormula>) = {
        type: expression.type,
        formulas: []
      }

      for (const subf of expression.formulas) {
        const newSubf = mostlyConvertToPNF(subf, counter, replacementMap)
        const ssubfs = [newSubf]

        for (const ssubf of ssubfs) {
          if (ssubf.type === 'universalQuantification' || ssubf.type === 'existentialQuantification') {
            combinedPrefix.push({
              type: ssubf.type,
              variable: ssubf.variable
            })

            ssubfs.push(ssubf.formula)
          } else {
            inner.formulas.push(ssubf as TResolution.SimplifiedInnerFormula)
          }
        }
      }

      // Recombine the prefix with the inner expression
      let current: TResolution.SimplifiedFormula = inner

      for (const pref of combinedPrefix.reverse()) {
        current = {
          formula: current as TResolution.SimplifiedInnerFormula,
          ...pref
        }
      }

      return current
    }
  }
}


export function convertToPNF(
  expression: TResolution.SimplifiedFormula,
  counter: { value: TNum.UInt32 } = { value: 1 },
  replacementMap: Map<string, TResolution.FOLTerm> = new Map(),
): TResolution.PNFFormula {
  for (const variable of extractFreeVariables(expression)) {
    replacementMap.set(variable, { type: 'variable', name: variable })
  }

  return simplify(mostlyConvertToPNF(expression, counter, replacementMap)) as TResolution.PNFFormula
}
