import Polynomial from '../support/polynomial'
import dividedDifferences from '../support/divided_differences'

export default Object.freeze({
  name: 'Newton polynomial',
  color: '#b73945',
  fit (f, points) {
    if (points.length === 0) {
      return new Polynomial([0])
    }

    let result = new Polynomial([f(points[0])])

    for (let k = 1; k < points.length; k++) {
      let current = new Polynomial([dividedDifferences(f, points.slice(0, k + 1))])

      for (let i = 0; i <= k - 1; i++) {
        current = current.multiply(new Polynomial([1, -points[i]]))
      }

      result = result.add(current)
    }

    return result
  }
})
