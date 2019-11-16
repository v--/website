import { map, zip } from '../../../common/support/iteration.js'

import { stringifyLinearCombination } from './stringify.js'
import { BSpline } from './b_spline.js'

function * iterExtendedDomain (degree, x) {
  const n = x.length
  const differences = map(([a, b]) => a - b, zip(x.slice(1), x.slice(0, n - 1)))
  const diameter = Math.max(1, Math.max(...differences))

  yield x[0] - diameter
  yield * x

  for (let i = 1; i < degree + 1; i++) {
    yield x[n - 1] + i * diameter
  }
}

function * iterBasis (degree, x) {
  const domain = Array.from(iterExtendedDomain(degree, x))

  for (let i = 0; i < x.length; i++) {
    yield new BSpline(domain.slice(i, i + degree + 2))
  }
}

export class Spline {
  static fromDataPoints (degree, x, y) {
    const basis = Array.from(iterBasis(degree, x))
    const n = x.length
    const coef = Array(n).fill(0)

    for (let i = 0; i < n; i++) {
      let prod = 0

      for (let j = 0; j < i; j++) {
        prod += basis[j].eval(x[i]) * coef[j]
      }

      coef[i] = (y[i] - prod) / basis[i].eval(x[i])
    }

    return new this(basis, coef)
  }

  constructor (basis, coef) {
    this.basis = basis
    this.coef = coef
  }

  eval (x) {
    let result = 0

    for (const [coef, fun] of zip(this.coef, this.basis)) {
      result += coef * fun.eval(x)
    }

    return result
  }

  toString () {
    return stringifyLinearCombination(this.coef, this.basis.map(b => '*' + String(b)))
  }
}
