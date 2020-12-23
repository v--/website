import { Spline } from '../../../common/math/numeric/spline.js'
import { Polynomial } from '../../../common/math/algebra/polynomial.js'
import { Fitter } from '../types/fitter.js'
import { getMappingDomain, getMappingRange } from '../support/mapping.js'

export const quadraticSpline: Fitter = Object.freeze({
  name: 'Quadratic spline',
  date: '2018-09-10',
  fit(mapping) {
    const n = mapping.size

    if (n === 0) {
      return Polynomial.ZERO
    }

    const domain = getMappingDomain(mapping)
    const range = getMappingRange(mapping)
    return Spline.fromDataPoints(2, domain, range)
  }
})
