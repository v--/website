import { map, zip2 } from '../../support/iteration.js'

import { stringifyLinearCombination } from '../stringify.js'
import { IRealFunction } from '../types/real_function.js'
import { BSpline } from './b_spline.js'

function * iterExtendedDomain(degree: Num.UInt32, x: Num.Float64[]): Generator<Num.Float64, void, undefined> {
  const n = x.length
  const differences = map(([a, b]) => a - b, zip2(x.slice(1), x.slice(0, n - 1)))
  const diameter = Math.max(1, Math.max(...differences))

  yield x[0] - diameter
  yield * x

  for (let i = 1; i < degree + 1; i++) {
    yield x[n - 1] + i * diameter
  }
}

function * iterBasis(degree: Num.UInt32, x: Num.Float64[]) {
  const domain = Array.from(iterExtendedDomain(degree, x))

  for (let i = 0; i < x.length; i++) {
    yield new BSpline({ points: domain.slice(i, i + degree + 2) })
  }
}

export interface SplineParams {
  basis: BSpline[]
  coef: Num.Float64[]
}

export interface Spline extends SplineParams, IRealFunction {}
export class Spline {
  static fromDataPoints(degree: Num.UInt32, x: Num.Float64[], y: Num.Float64[]) {
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

    return new this({ basis, coef })
  }

  constructor(params: SplineParams) {
    Object.assign(this, params)
  }

  eval(x: Num.Float64) {
    let result = 0

    for (const [coef, fun] of zip2(this.coef, this.basis)) {
      result += coef * fun.eval(x)
    }

    return result
  }

  toString() {
    return stringifyLinearCombination(this.coef, this.basis.map(b => '*' + String(b)))
  }
}
