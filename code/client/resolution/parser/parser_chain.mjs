import { CoolError } from '../../../common/errors.mjs'

export class ParserError extends CoolError {}

export function createParserChain (...chain) {
  return function (string) {
    for (const parser of chain) {
      const { value, tail } = parser(string)

      if (value !== null) {
        return { value, tail }
      }
    }

    return { value: null, tail: string }
  }
}
