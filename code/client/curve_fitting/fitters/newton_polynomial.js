import { Polynomial } from '../../../common/math/algebra/polynomial.js'
import { dividedDifferences } from '../../../common/math/numeric/divided_differences.js'
import { getMappingDomain } from '../support/mapping.js'

/** @type {TCurves.Fitter} */
export const newtonPolynomial = Object.freeze({
  name: 'Newton polynomial',
  date: '2018-22-07',
  fit(mapping) {
    const n = mapping.size

    if (n === 0) {
      return Polynomial.ZERO
    }

    const x = getMappingDomain(mapping)

    /** @param {TNum.Float64} x */
    function f(x) {
      return /** @type {TNum.Float64} */ (
        mapping.get(x)
      )
    }

    let result = new Polynomial({ coef: [f(x[0])] })

    for (let k = 1; k < n; k++) {
      let current = new Polynomial({
        coef: [dividedDifferences(f, x.slice(0, k + 1))]
      })

      for (let i = 0; i <= k - 1; i++) {
        current = current.mult(new Polynomial({
          coef: [-x[i], 1]
        }))
      }

      result = result.add(current)
    }

    return result
  }
})
