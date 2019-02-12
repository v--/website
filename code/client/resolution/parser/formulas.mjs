import { createParserChain } from './parser_chain.mjs'
import { parseVariable, parseCallable } from './terms.mjs'
import FormulaType from '../../../../code/client/resolution/enums/formula_type.mjs'

const predicateSigils = new Set(['p', 'q', 'r'])

export function parsePredicate (string) {
  return parseCallable(string, predicateSigils, FormulaType.PREDICATE)
}

export function parseNegation (string) {
  if (string[0] === '!') {
    const { value: formula, tail } = parseFormula(string.slice(1))

    if (formula) {
      return { tail, value: { type: FormulaType.NEGATION, formula } }
    }
  }

  return { tail: string, value: null }
}

function parseConnective (string) {
  if (string.length === 0) {
    return { connective: null, tail: string }
  }

  switch (string[0]) {
    case '&':
      return { connective: FormulaType.CONJUNCTION, tail: string.slice(1) }

    case 'v':
      return { connective: FormulaType.DISJUNCTION, tail: string.slice(1) }

    case '<':
      if (string[1] === '-' && string[2] === '>') {
        return { connective: FormulaType.EQUIVALENCE, tail: string.slice(3) }
      }

      return { connective: null, tail: string }

    case '-':
      if (string[1] === '>') {
        return { connective: FormulaType.IMPLICATION, tail: string.slice(2) }
      }

      return { connective: null, tail: string }

    default:
      return { connective: null, tail: string }
  }
}

export function parseQuantification (string) {
  if (string[0] !== 'A' && string[0] !== 'E') {
    return { tail: string, value: null }
  }

  let { value: variable, tail: variableTail } = parseVariable(string.slice(1))

  if (variable === null) {
    return { tail: string, value: null }
  }

  let { value: formula, tail: formulaTail } = parseFormula(variableTail)

  if (formula === null) {
    return { tail: string, value: null }
  }

  return {
    tail: formulaTail,
    value: {
      formula,
      type: string[0] === 'A' ? FormulaType.UNIVERSAL_QUANTIFICATION : FormulaType.EXISTENTIAL_QUANTIFICATION,
      variable: variable.name
    }
  }
}

export function parseConnectiveFormula (string) {
  if (string.length === 0 || string[0] !== '(') {
    return { tail: string, value: null }
  }

  let { value: first, tail: initialTail } = parseFormula(string.slice(1))

  if (first === null) {
    return { tail: string, value: null }
  }

  let { connective, tail } = parseConnective(initialTail)

  const formulas = [first]

  while (tail.length > 0) {
    const parsed = parseFormula(tail)
    let { connective: newConnective, tail: newTail } = parseConnective(parsed.tail)

    if (parsed.value === null || (newConnective && newConnective !== connective) || (formulas.length === 2 && (connective === FormulaType.IMPLICATION || connective === FormulaType.EQUIVALENCE))) {
      return { tail: string, value: null }
    }

    formulas.push(parsed.value)

    if (newTail[0] === ')') {
      tail = newTail.slice(1)
      break
    } else if (newTail.length > 1) {
      tail = newTail
    } else {
      return { tail: string, value: null }
    }
  }

  return {
    tail,
    value: {
      type: connective,
      formulas
    }
  }
}

export const parseFormula = createParserChain(
  parsePredicate,
  parseNegation,
  parseQuantification,
  parseConnectiveFormula
)
