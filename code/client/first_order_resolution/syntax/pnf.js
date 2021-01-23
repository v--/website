import { replaceVariables } from './replacement.js'
import { extractFreeVariables } from './extractors.js'
import { simplify } from './simplification.js'

/**
 * @param {TResolution.SimplifiedFormula} expression
 * @param {{ value: TNum.UInt32 }} counter
 * @param {TResolution.NameMap} nameMap
 * @returns {TResolution.SimplifiedFormula}
 */
export function mostlyConvertToPNF(expression, counter = { value: 1 }, nameMap = new Map()) {
  switch (expression.type) {
    case 'predicate':
      return {
        type: expression.type,
        name: expression.name,
        args: expression.args.map(arg => /** @type {TResolution.Term} */ (replaceVariables(arg, nameMap)))
      }

    case 'universalQuantification':
    case 'existentialQuantification':
    {
      const oldReplacement = nameMap.get(expression.variable)
      const newVarName = oldReplacement ? 't' + counter.value++ : expression.variable
      nameMap.set(expression.variable, { type: 'variable', name: newVarName })
      const newSubformula = /** @type {TResolution.SimplifiedInnerFormula} */ (
        mostlyConvertToPNF(expression.formula, counter, nameMap)
      )

      if (oldReplacement) {
        nameMap.set(expression.variable, oldReplacement)
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
        formula: /** @type {TResolution.SimplifiedInnerFormula} */ (
          mostlyConvertToPNF(expression.formula, counter, nameMap) 
        )
      }

    case 'conjunction':
    case 'disjunction':
    {
      // Split the prefix and the inner expression
      /** @type {Array<TCons.PartialWith<TResolution.QuantificationExpression, 'formula'>>} */
      const combinedPrefix = []

      /** @type {TResolution.ConjunctionExpression<TResolution.SimplifiedFormula> | TResolution.DisjunctionExpression<TResolution.SimplifiedInnerFormula>} */
      const inner = {
        type: expression.type,
        formulas: []
      }

      for (const subf of expression.formulas) {
        const newSubf = mostlyConvertToPNF(subf, counter, nameMap)
        const ssubfs = [newSubf]

        for (const ssubf of ssubfs) {
          if (ssubf.type === 'universalQuantification' || ssubf.type === 'existentialQuantification') {
            combinedPrefix.push({
              type: ssubf.type,
              variable: ssubf.variable
            })

            ssubfs.push(ssubf.formula)
          } else {
            inner.formulas.push(/** @type {TResolution.SimplifiedInnerFormula} */ (ssubf))
          }
        }
      }

      // Recombine the prefix with the inner expression
      /** @type {TResolution.Formula} */
      let current = inner

      for (const pref of combinedPrefix.reverse()) {
        current = {
          formula: /** @type {TResolution.SimplifiedInnerFormula} */ (current),
          ...pref
        }
      }

      return /** @type {TResolution.SimplifiedInnerFormula} */ (current)
    }
  }
}

/**
 * @param {TResolution.SimplifiedFormula} expression
 * @param {{ value: TNum.UInt32 }} counter
 * @param {TResolution.NameMap} replacementMap
 * @returns {TResolution.PNFFormula}
 */
export function convertToPNF(expression, counter = { value: 1 }, replacementMap = new Map()) {
  for (const variable of extractFreeVariables(expression)) {
    replacementMap.set(variable, { type: 'variable', name: variable })
  }

  return /** @type {TResolution.PNFFormula} */ (
    simplify(mostlyConvertToPNF(expression, counter, replacementMap))
  )
}
