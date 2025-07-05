import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { EMPTY, range } from './base.ts'
import { product } from './product.ts'

describe('product function', function () {
  it('multiplies zero iterables', function () {
    const prod = product()
    assert.deepEqual(Array.from(prod), [])
  })

  it('produces empty iterables when fed at least one empty iterable', function () {
    const prod = product(range(1, 10), EMPTY)
    assert.deepEqual(Array.from(prod), [])
  })

  it('produces a cartessian product of one iterable', function () {
    const prod = product(range(1, 4))
    assert.deepEqual(Array.from(prod), [[1], [2], [3]])
  })

  it('produces a cartessian product of two iterables', function () {
    const prod = product(range(1, 3), range(1, 3))
    assert.deepEqual(Array.from(prod), [[1, 1], [1, 2], [2, 1], [2, 2]])
  })
})
