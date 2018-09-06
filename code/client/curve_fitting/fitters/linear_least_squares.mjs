import { reduce, zip, map } from '../../../common/support/iteration'

import Polynomial from '../support/polynomial'

function sum (values) {
  return reduce((value, accum) => value + accum, values, 0)
}

function products (seqA, seqB) {
  return map(([a, b]) => a * b, zip(seqA, seqB))
}

export default Object.freeze({
  name: 'Linear least squares',
  color: '#c35fcd',
  fit (f, x) {
    const n = x.length

    if (n === 0) {
      return new Polynomial([0])
    }

    const y = x.map(point => f(point))
    const b = (n * sum(products(x, y)) - sum(x) * sum(y)) / (n * sum(products(x, x)) - sum(x) * sum(x))
    const a = sum(y) / n - b * sum(x) / n

    return new Polynomial([b, a])
  }
})
