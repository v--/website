import { CoolError } from '../../../common/errors.js'
import { repr } from '../../../common/support/strings.js'
import { IParseTree, parse, ParserError } from '../../../common/support/parser.js'

import { TokenType } from '../enums/token_type.js'
import { ExpressionType } from '../enums/expression_type.js'

import { folRules } from './parser_rules.js'
import { FOLExpression, FOLFormula, FOLTerm, VariableExpression } from '../types/expression.js'

export class FormulaASTError extends CoolError {}

export function buildAST(parseTree: IParseTree): FOLExpression | string | (FOLExpression | string)[] {
  const matchesAsTrees = parseTree.matches as IParseTree[]

  switch (parseTree.type) {
    case TokenType.arguments:
      return matchesAsTrees.filter(m => m.type === TokenType.term).map(buildAST) as FOLFormula[]

    case TokenType.whitespace:
      return ''

    case TokenType.naturalNumber:
      return matchesAsTrees.join('')

    case TokenType.functionName:
    case TokenType.predicateName:
      if (parseTree.matches.length === 1) {
        return parseTree.matches[0] as string
      }

      return parseTree.matches[0] as string + buildAST(matchesAsTrees[1])

    case TokenType.variable:
      return {
        type: ExpressionType.variable,
        name: matchesAsTrees[0] + (matchesAsTrees.length === 1 ? '' : buildAST(matchesAsTrees[1]) as string)
      }

    case TokenType.function:
      return {
        type: ExpressionType.function,
        name: buildAST(matchesAsTrees[0]) as string,
        args: matchesAsTrees.length === 1 ? [] : buildAST(matchesAsTrees[1]) as FOLTerm[]
      }

    case TokenType.predicate:
      return {
        type: ExpressionType.predicate,
        name: buildAST(matchesAsTrees[0]) as string,
        args: buildAST(matchesAsTrees[1]) as FOLTerm[]
      }

    case TokenType.term:
    case TokenType.formula:
      return buildAST(matchesAsTrees[0])

    case TokenType.topLevelFormula:
      return buildAST(matchesAsTrees[1])

    case TokenType.negation:
      return {
        type: ExpressionType.negation,
        formula: buildAST(matchesAsTrees[1]) as FOLFormula
      }

    case TokenType.universalQuantification:
      return {
        type: ExpressionType.universalQuantification,
        variable: (buildAST(matchesAsTrees[2]) as VariableExpression).name,
        formula: buildAST(matchesAsTrees[4]) as FOLFormula
      }

    case TokenType.existentialQuantification:
      return {
        type: ExpressionType.existentialQuantification,
        variable: (buildAST(matchesAsTrees[2]) as VariableExpression).name,
        formula: buildAST(matchesAsTrees[4]) as FOLFormula
      }

    case TokenType.conjunction:
      return {
        type: ExpressionType.conjunction,
        formulas: matchesAsTrees.filter(m => m.type === TokenType.formula).map(buildAST) as FOLFormula[]
      }

    case TokenType.disjunction:
      return {
        type: ExpressionType.disjunction,
        formulas: matchesAsTrees.filter(m => m.type === TokenType.formula).map(buildAST) as FOLFormula[]
      }

    case TokenType.implication:
      return {
        type: ExpressionType.implication,
        formulas: matchesAsTrees.filter(m => m.type === TokenType.formula).map(buildAST) as FOLFormula[]
      }

    case TokenType.equivalence:
      return {
        type: ExpressionType.equivalence,
        formulas: matchesAsTrees.filter(m => m.type === TokenType.formula).map(buildAST) as FOLFormula[]
      }

    case TokenType.connectiveFormula:
      return buildAST(matchesAsTrees[2])

    default:
      throw new FormulaASTError('Unknown token type ' + repr(parseTree.type))
  }
}

export function parseExpression(string: string, initialRuleRef: TokenType = TokenType.topLevelFormula) {
  return buildAST(parse(folRules, initialRuleRef, string)) as FOLFormula
}

export function parseExpressionSilently(string: string, initialRuleRef?: TokenType) {
  try {
    return parseExpression(string, initialRuleRef)
  } catch (err) {
    if (err instanceof ParserError) {
      return undefined
    }

    throw err
  }
}
