import { reduce, zip, map } from '../../../common/support/iteration.mjs'

import Polynomial from '../support/polynomial.mjs'

function sum (values) {
  return reduce((value, accum) => value + accum, values, 0)
}

function products (seqA, seqB) {
  return map(([a, b]) => a * b, zip(seqA, seqB))
}

export default Object.freeze({
  name: 'Linear least squares',
  date: '2018-09-06',
  color: '#c35fcd',
  fit (mapping) {
    if (mapping.n === 0) {
      return new Polynomial([0])
    }

    const n = mapping.n
    const x = mapping.domain
    const y = mapping.range

    const b = (n * sum(products(x, y)) - sum(x) * sum(y)) / (n * sum(products(x, x)) - sum(x) * sum(x))
    const a = sum(y) / n - b * sum(x) / n

    return new Polynomial([b, a])
  }
})
