import { parseVariable, parseFunction, parseTerm } from './terms.mjs'
import { parsePredicate, parseNegation, parseConnectiveFormula, parseQuantification, parseFormula } from './formulas.mjs'

export function buildFormula (string) {
  const { value: formula, tail } = parseFormula(string.replace(/\s+/g, ''))

  if (tail.length > 0) {
    return null
  }

  return formula
}

export {
  parseVariable,
  parseFunction,
  parseTerm,

  parsePredicate,
  parseNegation,
  parseConnectiveFormula,
  parseQuantification,
  parseFormula
}
