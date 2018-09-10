import { repr } from '../../../common/support/strings.mjs'
import { CoolError } from '../../../common/errors.mjs'

export class StringifyError extends CoolError {}

export function stringifyNumber (x) {
  const s = String(Math.round(1e4 * x) / 1e4)

  if (s === '0' && x !== 0) {
    const exponent = Math.floor(Math.log10(x))
    const normalized = Math.pow(10, -exponent) * x
    return normalized.toFixed(0) + `e${exponent}`
  }

  return s
}

export function stringifyLinearCombination (coef, values) {
  if (coef.length !== values.length) {
    throw new StringifyError(`Mismatch between the dimensions of ${repr(coef)} and ${repr(values)}`)
  }

  let result = ''

  for (let i = 0; i < coef.length; i++) {
    const c = coef[i]
    const cString = Math.abs(c) === 1 ? '' : stringifyNumber(Math.abs(c))
    const vString = String(values[i])

    if (c === 0) {
      continue
    } else {
      if (result !== '') {
        result += c > 0 ? ' + ' : ' - '
      } else if (c < 0) {
        result += '-'
      }

      if (vString === '') {
        result += Math.abs(c) === 1 ? '1' : cString
      } else {
        result += cString + vString
      }
    }
  }

  if (result === '') {
    return '0'
  }

  return result
}
