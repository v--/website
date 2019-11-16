import { Polynomial } from '../../../common/math/algebra/polynomial.js'
import { dividedDifferences } from '../../../common/math/numeric/divided_differences.js'

export const newtonPolynomial = Object.freeze({
  name: 'Newton polynomial',
  date: '2018-22-07',
  fit (mapping) {
    if (mapping.n === 0) {
      return new Polynomial([0])
    }

    const x = mapping.domain
    const f = x => mapping.get(x)

    let result = new Polynomial([f(x[0])])

    for (let k = 1; k < mapping.n; k++) {
      let current = new Polynomial([dividedDifferences(f, x.slice(0, k + 1))])

      for (let i = 0; i <= k - 1; i++) {
        current = current.mult(new Polynomial([-x[i], 1]))
      }

      result = result.add(current)
    }

    return result
  }
})
