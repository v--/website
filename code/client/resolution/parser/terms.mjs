import TermType from '../enums/term_type.mjs'
import { createParserChain } from './parser_chain.mjs'

const numerals = new Set(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'])
const variableSigils = new Set(['x', 'y', 'z'])
const functionSigils = new Set(['f', 'g', 'h'])

export function parseValue (string, sigilSet, type) {
  let name = null
  let tail = ''

  if (sigilSet.has(string[0])) {
    name = string[0]

    for (let i = 1; i < string.length; i++) {
      if (numerals.has(string[i])) {
        name += string[i]
      } else {
        tail = string.slice(i)
        break
      }
    }
  } else {
    tail = string
  }

  if (name === null) {
    return { tail, value: null }
  }

  return { tail, value: { type, name } }
}

export function parseVariable (string) {
  return parseValue(string, variableSigils, TermType.VARIABLE)
}

export function parseCallable (string, sigilSet, type) {
  const result = parseValue(string, sigilSet, type)

  if (result.value === null || result.tail[0] !== '(') {
    return { tail: string, value: null }
  } else {
    result.value.args = []
    result.tail = result.tail.slice(1)

    while (result.tail.length > 0) {
      const parsed = parseTerm(result.tail)

      if (parsed.value) {
        result.value.args.push(parsed.value)

        if (parsed.tail[0] === ')') {
          result.tail = parsed.tail.slice(1)
          break
        }

        if (parsed.tail[0] === ',') {
          result.tail = parsed.tail.slice(1)
          continue
        }

        return { tail: string, value: null }
      } else {
        break
      }
    }

    if (result.value.args.length === 0) {
      return { tail: string, value: null }
    }

    return result
  }
}

function parseConstant (string) {
  const { value, tail } = parseValue(string, functionSigils, TermType.FUNCTION)

  if (value) {
    value.args = []
  }

  return { value, tail }
}

function parseTrueFunction (string) {
  return parseCallable(string, functionSigils, TermType.FUNCTION)
}

export const parseFunction = createParserChain(
  parseTrueFunction,
  parseConstant
)

export const parseTerm = createParserChain(
  parseVariable,
  parseFunction
)
