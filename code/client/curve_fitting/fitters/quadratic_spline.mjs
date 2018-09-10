import Spline from '../symbolic/spline.mjs'
import Polynomial from '../symbolic/polynomial.mjs'

export default Object.freeze({
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
