import { Spline } from '../../../common/math/numeric/spline.js'
import { Polynomial } from '../../../common/math/algebra/polynomial.js'
import { getMappingDomain, getMappingRange } from '../support/mapping.js'

/** @type {TCurves.Fitter} */
export const linearSpline = Object.freeze({
  name: 'Linear spline',
  date: '2018-09-10',
  fit(mapping) {
    if (mapping.size === 0) {
      return Polynomial.ZERO
    }

    const domain = getMappingDomain(mapping)
    const range = getMappingRange(mapping)
    return Spline.fromDataPoints(1, domain, range)
  }
})
