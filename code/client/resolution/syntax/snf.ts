import { replaceVariables } from './replacement.js'

export function convertToSNF(
  formula: TResolution.PNFFormula,
  counter: { value: TNum.UInt32 } = { value: 1 },
  nameMap: Map<string, TResolution.FOLTerm> = new Map(),
  univVarNames: string[] = []
): TResolution.SNFFormula {
  switch (formula.type) {
    case 'predicate':
      return {
        type: formula.type,
        name: formula.name,
        args: formula.args.map(function(term) {
          return replaceVariables(term, nameMap) as TResolution.FOLTerm
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
        formula: convertToSNF(formula.formula, counter, nameMap, univVarNames) as TResolution.SNFInnerFormula
      }

    case 'conjunction':
    case 'disjunction':
      return {
        type: formula.type,
        formulas: (formula.formulas as TResolution.SNFInnerFormula[]).map(f => convertToSNF(f, counter, nameMap, univVarNames)) as TResolution.SNFInnerFormula[]
      }
  }
}
