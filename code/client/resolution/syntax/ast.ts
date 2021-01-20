import { CoolError } from '../../../common/errors.js'
import { repr } from '../../../common/support/strings.js'
import { IParseTree, parse, ParserError } from '../../../common/support/parser.js'

import { folRules } from './parser_rules.js'

export class FormulaASTError extends CoolError {}

export function buildAST(parseTree: IParseTree): TResolution.FOLExpression | string | (TResolution.FOLExpression | string)[] {
  const matchesAsTrees = parseTree.matches as IParseTree[]

  switch (parseTree.type) {
    case 'arguments':
      return matchesAsTrees.filter(m => m.type === 'term').map(buildAST) as TResolution.FOLFormula[]

    case 'whitespace':
      return ''

    case 'naturalNumber':
      return matchesAsTrees.join('')

    case 'functionName':
    case 'predicateName':
      if (parseTree.matches.length === 1) {
        return parseTree.matches[0] as string
      }

      return parseTree.matches[0] as string + buildAST(matchesAsTrees[1])

    case 'variable':
      return {
        type: 'variable',
        name: matchesAsTrees[0] + (matchesAsTrees.length === 1 ? '' : buildAST(matchesAsTrees[1]) as string)
      }

    case 'function':
      return {
        type: 'function',
        name: buildAST(matchesAsTrees[0]) as string,
        args: matchesAsTrees.length === 1 ? [] : buildAST(matchesAsTrees[1]) as TResolution.FOLTerm[]
      }

    case 'predicate':
      return {
        type: 'predicate',
        name: buildAST(matchesAsTrees[0]) as string,
        args: buildAST(matchesAsTrees[1]) as TResolution.FOLTerm[]
      }

    case 'term':
    case 'formula':
      return buildAST(matchesAsTrees[0])

    case 'topLevelFormula':
      return buildAST(matchesAsTrees[1])

    case 'negation':
      return {
        type: 'negation',
        formula: buildAST(matchesAsTrees[1]) as TResolution.FOLFormula
      }

    case 'universalQuantification':
      return {
        type: 'universalQuantification',
        variable: (buildAST(matchesAsTrees[2]) as TResolution.VariableExpression).name,
        formula: buildAST(matchesAsTrees[4]) as TResolution.FOLFormula
      }

    case 'existentialQuantification':
      return {
        type: 'existentialQuantification',
        variable: (buildAST(matchesAsTrees[2]) as TResolution.VariableExpression).name,
        formula: buildAST(matchesAsTrees[4]) as TResolution.FOLFormula
      }

    case 'conjunction':
      return {
        type: 'conjunction',
        formulas: matchesAsTrees.filter(m => m.type === 'formula').map(buildAST) as TResolution.FOLFormula[]
      }

    case 'disjunction':
      return {
        type: 'disjunction',
        formulas: matchesAsTrees.filter(m => m.type === 'formula').map(buildAST) as TResolution.FOLFormula[]
      }

    case 'implication':
      return {
        type: 'implication',
        formulas: matchesAsTrees.filter(m => m.type === 'formula').map(buildAST) as TResolution.FOLFormula[]
      }

    case 'equivalence':
      return {
        type: 'equivalence',
        formulas: matchesAsTrees.filter(m => m.type === 'formula').map(buildAST) as TResolution.FOLFormula[]
      }

    case 'connectiveFormula':
      return buildAST(matchesAsTrees[2])

    default:
      throw new FormulaASTError('Unknown token type ' + repr(parseTree.type))
  }
}

export function parseExpression(string: string, initialRuleRef: TResolution.TokenType = 'topLevelFormula') {
  return buildAST(parse(folRules, initialRuleRef, string)) as TResolution.FOLFormula
}

export function parseExpressionSilently(string: string, initialRuleRef?: TResolution.TokenType) {
  try {
    return parseExpression(string, initialRuleRef)
  } catch (err) {
    if (err instanceof ParserError) {
      return undefined
    }

    throw err
  }
}
