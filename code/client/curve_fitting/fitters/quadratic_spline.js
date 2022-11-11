import { Spline } from '../../../common/math/numeric/spline.js'
import { Polynomial } from '../../../common/math/algebra/polynomial.js'
import { getMappingDomain, getMappingRange } from '../support/mapping.js'

/** @type {TCurves.Fitter} */
export const quadraticSpline = Object.freeze({
  name: 'Quadratic spline',
  date: '2018-09-10',

  /**
   * @param {Map<TNum.Float64, TNum.Float64>} mapping
   */
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
