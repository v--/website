import { Polynomial } from '../../../common/math/algebra/polynomial.js'
import { dividedDifferences } from '../../../common/math/numeric/divided_differences.js'
import { float64 } from '../../../common/types/numeric.js'
import { getMappingDomain } from '../support/mapping.js'
import { Fitter } from '../types/fitter.js'

export const newtonPolynomial: Fitter = Object.freeze({
  name: 'Newton polynomial',
  date: '2018-22-07',
  fit(mapping) {
    const n = mapping.size

    if (n === 0) {
      return Polynomial.ZERO
    }

    const x = getMappingDomain(mapping)
    const f = (x: float64) => mapping.get(x)!

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
