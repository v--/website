import { CoolError } from '../../../common/errors'
import { repr } from '../../../common/support/strings.js'
import { parse, ParserError } from '../../../common/support/parser.js'

import { folRules } from './parser_rules.js'

export class FormulaASTError extends CoolError {}

/**
 * @param {TParsing.IParseTree} parseTree
 * @return {TResolution.Expression | string | (TResolution.Expression | string)[]}
 */
export function buildAST(parseTree) {
  const matchesAsTrees = /** @type {TParsing.IParseTree[]} */ (
    parseTree.matches
  )

  switch (parseTree.type) {
    case 'arguments':
      return /** @type {TResolution.Formula[]} */ (
        matchesAsTrees.filter(m => m.type === 'term').map(buildAST)
      )

    case 'whitespace':
      return ''

    case 'naturalNumber':
      return matchesAsTrees.join('')

    case 'functionName':
    case 'predicateName':
      if (parseTree.matches.length === 1) {
        return /** @type {string} */ (parseTree.matches[0])
      }

      return /** @type {string} */ (parseTree.matches[0]) + buildAST(matchesAsTrees[1])

    case 'variable':
      return {
        type: 'variable',
        name: matchesAsTrees[0] + (
          matchesAsTrees.length === 1 ? '' : /** @type {string} */ (buildAST(matchesAsTrees[1]))
        )
      }

    case 'function':
      return {
        type: 'function',
        name: /** @type {string} */ (buildAST(matchesAsTrees[0])),
        args: matchesAsTrees.length === 1 ?
          [] :
          /** @type {TResolution.Term[]} */ (buildAST(matchesAsTrees[1]))
      }

    case 'predicate':
      return {
        type: 'predicate',
        name: /** @type {string} */ (buildAST(matchesAsTrees[0])),
        args: /** @type {TResolution.Term[]} */ (buildAST(matchesAsTrees[1]))
      }

    case 'term':
    case 'formula':
      return buildAST(matchesAsTrees[0])

    case 'topLevelFormula':
      return buildAST(matchesAsTrees[1])

    case 'negation':
      return {
        type: 'negation',
        formula: /** @type {TResolution.Formula} */ (buildAST(matchesAsTrees[1]))
      }

    case 'universalQuantification':
      return {
        type: 'universalQuantification',
        variable: (/** @type {TResolution.VariableExpression} */ (buildAST(matchesAsTrees[2]))).name,
        formula: /** @type {TResolution.Formula} */ (buildAST(matchesAsTrees[4]))
      }

    case 'existentialQuantification':
      return {
        type: 'existentialQuantification',
        variable: (/** @type {TResolution.VariableExpression} */ (buildAST(matchesAsTrees[2]))).name,
        formula: /** @type {TResolution.Formula} */ (buildAST(matchesAsTrees[4]))
      }

    case 'conjunction':
      return {
        type: 'conjunction',
        formulas: /** @type {TResolution.Formula[]} */ (
          matchesAsTrees.filter(m => m.type === 'formula').map(buildAST)
        )
      }

    case 'disjunction':
      return {
        type: 'disjunction',
        formulas: /** @type {TResolution.Formula[]} */ (
          matchesAsTrees.filter(m => m.type === 'formula').map(buildAST) 
        )
      }

    case 'implication':
      return {
        type: 'implication',
        formulas: /** @type {TResolution.Formula[]} */ (
          matchesAsTrees.filter(m => m.type === 'formula').map(buildAST)
        )
      }

    case 'equivalence':
      return {
        type: 'equivalence',
        formulas: /** @type {TResolution.Formula[]} */ (
          matchesAsTrees.filter(m => m.type === 'formula').map(buildAST)
        )
      }

    case 'connectiveFormula':
      return buildAST(matchesAsTrees[2])

    default:
      throw new FormulaASTError('Unknown token type ' + repr(parseTree.type))
  }
}

/**
 * @param {string} string
 * @param {TResolution.TokenType} initialRuleRef
 */
export function parseExpression(string, initialRuleRef = 'topLevelFormula') {
  return /** @type {TResolution.Formula} */ (
    buildAST(parse(folRules, initialRuleRef, string))
  )
}

/**
 * @param {string} string
 * @param {TResolution.TokenType} [initialRuleRef]
 */
export function parseExpressionSilently(string, initialRuleRef) {
  try {
    return parseExpression(string, initialRuleRef)
  } catch (err) {
    if (err instanceof ParserError) {
      return undefined
    }

    throw err
  }
}
