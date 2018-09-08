import Polynomial from '../support/polynomial.mjs'
import dividedDifferences from '../support/divided_differences.mjs'

export default Object.freeze({
  name: 'Newton polynomial',
  date: '22.07.2018',
  color: '#b73945',
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
        current = current.multiply(new Polynomial([1, -x[i]]))
      }

      result = result.add(current)
    }

    return result
  }
})
