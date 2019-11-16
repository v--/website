import { Spline } from '../../../common/math/numeric/spline.js'
import { Polynomial } from '../../../common/math/algebra/polynomial.js'

export const quadraticSpline = Object.freeze({
  name: 'Quadratic spline',
  date: '2018-09-10',
  fit (mapping) {
    const n = mapping.n

    if (n === 0) {
      return new Polynomial([0])
    }

    return Spline.fromDataPoints(2, mapping.domain, mapping.range)
  }
})
