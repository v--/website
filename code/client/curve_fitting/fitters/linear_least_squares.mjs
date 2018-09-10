import { reduce } from '../../../common/support/iteration.mjs'

import Polynomial from '../symbolic/polynomial.mjs'

function sum (values) {
  return reduce((value, accum) => value + accum, values, 0)
}

function dot (x, y) {
  const n = Math.min(x.length, y.length)
  let prod = 0

  for (let i = 0; i < n; i++) {
    prod += x[i] * y[i]
  }

  return prod
}

export default Object.freeze({
  name: 'Linear least squares',
  date: '2018-09-06',
  hideByDefault: true,
  fit (mapping) {
    const n = mapping.n

    if (n === 1) {
      return new Polynomial([0])
    }

    const x = mapping.domain
    const y = mapping.range

    const sx = sum(x)
    const sy = sum(y)

    const b = (n * dot(x, y) - sx * sy) / (n * dot(x, x) - sx * sx)
    const a = (sy - b * sx) / n

    return new Polynomial([b, a])
  }
})
