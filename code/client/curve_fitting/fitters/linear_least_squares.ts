import { reduce } from '../../../common/support/iteration.js'

import { Polynomial } from '../../../common/math/algebra/polynomial.js'
import { Fitter } from '../types/fitter.js'
import { float64 } from '../../../common/types/numeric.js'
import { getMappingDomain, getMappingRange } from '../support/mapping.js'

function sum(values: float64[]): float64 {
  return reduce((value, accum) => value + accum, values, 0)
}

function dot(x: float64[], y: float64[]): float64 {
  const n = Math.min(x.length, y.length)
  let prod = 0

  for (let i = 0; i < n; i++) {
    prod += x[i] * y[i]
  }

  return prod
}

export const linearLeastSquares: Fitter = Object.freeze({
  name: 'Linear least squares',
  date: '2018-09-06',
  hideByDefault: true,
  fit(mapping) {
    const n = mapping.size
    const x = getMappingDomain(mapping)
    const y = getMappingRange(mapping)

    if (n === 1) {
      return new Polynomial({ coef: [y[0]] })
    }

    const sx = sum(x)
    const sy = sum(y)

    const b = (n * dot(x, y) - sx * sy) / (n * dot(x, x) - sx * sx)
    const a = (sy - b * sx) / n

    return new Polynomial({ coef: [b, a] })
  }
})
