import { chain, range, repeat, zip, map } from '../../../common/support/iteration.js'
import { stringifyLinearCombination } from '../support/stringify.js'

function monomialString (n) {
  if (n === 0) {
    return ''
  }

  if (n === 1) {
    return 'x'
  }

  return `x^${n}`
}

export default class Polynomial {
  constructor (coef) {
    let leadingZeros = 0

    for (const a of coef) {
      if (a === 0) {
        leadingZeros += 1
      } else {
        break
      }
    }

    this.coef = coef.slice(leadingZeros)

    if (this.coef.length === 0) {
      this.coef.push(0)
    }
  }

  add (other) {
    const n = Math.max(this.order, other.order)
    const coef = map(
      value => value[0] + value[1],
      zip(
        chain(repeat(0, n - this.order), this.coef),
        chain(repeat(0, n - other.order), other.coef)
      )
    )

    return new Polynomial(Array.from(coef))
  }

  multiply (other) {
    let result = new Polynomial([])

    for (let i = 0; i <= other.order; i++) {
      const addendCoefficients = chain(
        map(x => x * other.coef[i], this.coef),
        repeat(0, other.order - i)
      )

      result = result.add(new Polynomial(Array.from(addendCoefficients)))
    }

    return result
  }

  eval (x) {
    let result = 0

    for (let i = 0; i < this.order; i++) {
      result = x * (this.coef[i] + result)
    }

    result += this.coef[this.order]
    return result
  }

  get order () {
    return this.coef.length - 1
  }

  toString () {
    const monomials = Array.from(map(monomialString, range(this.order, -1, -1)))
    return stringifyLinearCombination(this.coef, monomials)
  }
}
