import { chain, repeat, zip, map } from '../../../common/support/iteration'

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

    this.coefficients = coefficients.slice(leadingZeros)
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
    if (this.order === 0 || other.order === 0) {
      return new Polynomial([])
    }

    let result = new Polynomial([])

    for (let i = 0; i < other.order; i++) {
      const addendCoefficients = chain(
        map(x => x * other.coefficients[i], this.coefficients),
        repeat(0, other.order - i - 1)
      )

      result = result.add(new Polynomial(Array.from(addendCoefficients)))
    }

    return result
  }

  evaluate (x) {
    let result = 0

    for (let i = 0; i < this.order - 1; i++) {
      result = x * (this.coefficients[i] + result)
    }

    result += this.coefficients[this.order - 1]
    return result
  }

  get order () {
    return this.coefficients.length
  }

  toString () {
    if (this.order === 0) {
      return '0'
    }

    let result = ''

    for (let i = 0; i < this.order; i++) {
      const a = this.coefficients[i]
      const aString = a === 1 ? '' : String(a)
      const termOrder = this.order - i - 1

      if (a === 0) {
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
