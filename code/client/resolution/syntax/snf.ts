import { uint32 } from '../../../common/types/numeric.js'
import { ExpressionType } from '../enums/expression_type.js'
import { FOLTerm, PNFFormula, SNFFormula, SNFInnerFormula } from '../types/expression.js'
import { replaceVariables } from './replacement.js'

export function convertToSNF(
  formula: PNFFormula,
  counter: { value: uint32 } = { value: 1 },
  nameMap: Map<string, FOLTerm> = new Map(),
  univVarNames: string[] = []
): SNFFormula {
  switch (formula.type) {
    case ExpressionType.predicate:
      return {
        type: formula.type,
        name: formula.name,
        args: formula.args.map(function(term) {
          return replaceVariables(term, nameMap) as FOLTerm
        })
      }

    case ExpressionType.universalQuantification:
      return {
        type: formula.type,
        variable: formula.variable,
        formula: convertToSNF(formula.formula, counter, nameMap, univVarNames.concat([formula.variable]))
      }

    case ExpressionType.existentialQuantification:
      nameMap.set(formula.variable, {
        type: ExpressionType.function,
        name: 'u' + counter.value++,
        args: univVarNames.map(function(varName) {
          return { type: ExpressionType.variable, name: varName }
        })
      })

      return convertToSNF(formula.formula, counter, nameMap, univVarNames)

    case ExpressionType.negation:
      return {
        type: formula.type,
        formula: convertToSNF(formula.formula, counter, nameMap, univVarNames) as SNFInnerFormula
      }

    case ExpressionType.conjunction:
    case ExpressionType.disjunction:
      return {
        type: formula.type,
        formulas: (formula.formulas as SNFInnerFormula[]).map(f => convertToSNF(f, counter, nameMap, univVarNames)) as SNFInnerFormula[]
      }
  }
}
