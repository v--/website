import { Spline } from '../../core/math/spline.js'
import { Polynomial } from '../../core/math/polynomial.js'

export const linearSpline = Object.freeze({
  name: 'Linear spline',
  date: '2018-09-10',
  fit (mapping) {
    const n = mapping.n

    if (n === 0) {
      return new Polynomial([0])
    }

    return Spline.fromDataPoints(1, mapping.domain, mapping.range)
  }
})
