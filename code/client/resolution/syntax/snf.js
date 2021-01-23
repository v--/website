import { replaceVariables } from './replacement.js'

/**
 * @param {TResolution.PNFFormula} formula
 * @param {{ value: TNum.UInt32 }} counter
 * @param {TResolution.NameMap} nameMap
 * @param {string[]} univVarNames
 * @returns {TResolution.SNFFormula}
 */
export function convertToSNF(formula, counter = { value: 1 }, nameMap = new Map(), univVarNames = []) {
  switch (formula.type) {
    case 'predicate':
      return {
        type: formula.type,
        name: formula.name,
        args: formula.args.map(function(term) {
          return /** @type {TResolution.Term} */ (
            replaceVariables(term, nameMap)
          )
        })
      }

    case 'universalQuantification':
      return {
        type: formula.type,
        variable: formula.variable,
        formula: convertToSNF(formula.formula, counter, nameMap, univVarNames.concat([formula.variable]))
      }

    case 'existentialQuantification':
      nameMap.set(formula.variable, {
        type: 'function',
        name: 'u' + counter.value++,
        args: univVarNames.map(function(varName) {
          return { type: 'variable', name: varName }
        })
      })

      return convertToSNF(formula.formula, counter, nameMap, univVarNames)

    case 'negation':
      return {
        type: formula.type,
        formula: /** @type {TResolution.SNFInnerFormula} */ (
          convertToSNF(formula.formula, counter, nameMap, univVarNames) 
        )
      }

    case 'conjunction':
    case 'disjunction':
      return {
        type: formula.type,
        formulas: /** @type {TResolution.SNFInnerFormula[]} */ (
          formula.formulas.map(f => convertToSNF(f, counter, nameMap, univVarNames)) 
        )
      }
  }
}
