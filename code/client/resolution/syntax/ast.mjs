import { CoolError } from '../../../common/errors.mjs'
import { repr } from '../../../common/support/strings.mjs'
import { parse } from '../../core/support/parser.mjs'

import TokenType from '../enums/token_type.mjs'
import ExpressionType from '../enums/expression_type.mjs'

import parserRules from './parser_rules.mjs'

export class ASTError extends CoolError {}

export function buildAST (parseTree) {
  switch (parseTree.type) {
    case TokenType.ARGUMENTS:
      return parseTree.matches.filter(m => m.type === TokenType.TERM).map(buildAST)

    case TokenType.WHITESPACE:
      return ''

    case TokenType.NATURAL_NUMBER:
      return parseTree.matches.join('')

    case TokenType.FUNCTION_NAME:
    case TokenType.PREDICATE_NAME:
      if (parseTree.matches.length === 1) {
        return parseTree.matches[0]
      }

      return parseTree.matches[0] + buildAST(parseTree.matches[1])

    case TokenType.VARIABLE:
      return {
        type: ExpressionType.VARIABLE,
        name: parseTree.matches[0] + (parseTree.matches.length === 1 ? '' : buildAST(parseTree.matches[1]))
      }

    case TokenType.FUNCTION:
      return {
        type: ExpressionType.FUNCTION,
        name: buildAST(parseTree.matches[0]),
        args: parseTree.matches.length === 1 ? [] : buildAST(parseTree.matches[1])
      }

    case TokenType.PREDICATE:
      return {
        type: ExpressionType.PREDICATE,
        name: buildAST(parseTree.matches[0]),
        args: buildAST(parseTree.matches[1])
      }

    case TokenType.TERM:
    case TokenType.FORMULA:
      return buildAST(parseTree.matches[0])

    case TokenType.TOP_LEVEL_FORMULA:
      return buildAST(parseTree.matches[1])

    case TokenType.NEGATION:
      return {
        type: ExpressionType.NEGATION,
        formula: buildAST(parseTree.matches[1])
      }

    case TokenType.UNIVERSAL_QUANTIFICATION:
      return {
        type: ExpressionType.UNIVERSAL_QUANTIFICATION,
        variable: buildAST(parseTree.matches[2]).name,
        formula: buildAST(parseTree.matches[4])
      }

    case TokenType.EXISTENTIAL_QUANTIFICATION:
      return {
        type: ExpressionType.EXISTENTIAL_QUANTIFICATION,
        variable: buildAST(parseTree.matches[2]).name,
        formula: buildAST(parseTree.matches[4])
      }

    case TokenType.CONJUNCTION:
      return {
        type: ExpressionType.CONJUNCTION,
        formulas: parseTree.matches.filter(m => m.type === TokenType.FORMULA).map(buildAST)
      }

    case TokenType.DISJUNCTION:
      return {
        type: ExpressionType.DISJUNCTION,
        formulas: parseTree.matches.filter(m => m.type === TokenType.FORMULA).map(buildAST)
      }

    case TokenType.IMPLICATION:
      return {
        type: ExpressionType.IMPLICATION,
        formulas: parseTree.matches.filter(m => m.type === TokenType.FORMULA).map(buildAST)
      }

    case TokenType.EQUIVALENCE:
      return {
        type: ExpressionType.EQUIVALENCE,
        formulas: parseTree.matches.filter(m => m.type === TokenType.FORMULA).map(buildAST)
      }

    case TokenType.CONNECTIVE_FORMULA:
      return buildAST(parseTree.matches[2])

    default:
      throw new ASTError('Unknown token type ' + repr(parseTree.type))
  }
}

export function parseExpression (string, type) {
  return buildAST(parse(parserRules, type, string))
}

export function parseTopLevelFormula (string) {
  return parseExpression(string, TokenType.TOP_LEVEL_FORMULA)
}
