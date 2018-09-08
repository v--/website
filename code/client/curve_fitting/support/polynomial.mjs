import { chain, repeat, zip, map } from '../../../common/support/iteration.mjs'

export default class Polynomial {
  constructor (coefficients) {
    let leadingZeros = 0

    for (const a of coefficients) {
      if (a === 0) {
        leadingZeros += 1
      } else {
        break
      }
    }

    this.coefficients = coefficients
      .slice(leadingZeros)
      .map(c => Math.round(c * 1e5) / 1e5)

    if (this.coefficients.length === 0) {
      this.coefficients.push(0)
    }
  }

  add (other) {
    const n = Math.max(this.order, other.order)
    const coefficients = map(
      value => value[0] + value[1],
      zip(
        chain(repeat(0, n - this.order), this.coefficients),
        chain(repeat(0, n - other.order), other.coefficients)
      )
    )

    return new Polynomial(Array.from(coefficients))
  }

  multiply (other) {
    let result = new Polynomial([])

    for (let i = 0; i <= other.order; i++) {
      const addendCoefficients = chain(
        map(x => x * other.coefficients[i], this.coefficients),
        repeat(0, other.order - i)
      )

      result = result.add(new Polynomial(Array.from(addendCoefficients)))
    }

    return result
  }

  evaluate (x) {
    let result = 0

    for (let i = 0; i < this.order; i++) {
      result = x * (this.coefficients[i] + result)
    }

    result += this.coefficients[this.order]
    return result
  }

  get order () {
    return this.coefficients.length - 1
  }

  toString () {
    let result = ''

    for (let i = 0; i <= this.order; i++) {
      const a = this.coefficients[i]
      const aString = a === 1 ? '' : String(a)
      const termOrder = this.order - i

      if (a === 0 && this.order > 0) {
        continue
      } else {
        if (result !== '') {
          result += ' + '
        }

        if (termOrder === 0) {
          result += String(a)
        } else if (termOrder === 1) {
          result += `${aString}x`
        } else {
          result += `${aString}x^${termOrder}`
        }
      }
    }

    return result
  }
}
