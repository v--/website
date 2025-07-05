import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { range } from './base.ts'
import { orderComparator, schwartzSort, shuffle, sort } from './sorting.ts'

describe('orderComparator function', function () {
  it('compares single-digit positive numbers correctly', function () {
    assert.equal(orderComparator(1, 3), -1)
  })

  it('compares single-digit mixed numbers correctly', function () {
    assert.equal(orderComparator(1, -1), 1)
  })

  it('compares numbers with a different number of digits correctly', function () {
    assert.equal(orderComparator(2, 10), -1)
  })
})

describe('shuffle function', function () {
  it('shuffles an iterator', function () {
    const shuffled = shuffle(range(1, 6))
    assert.deepEqual(sort(shuffled), [1, 2, 3, 4, 5])
  })

  it('does not mutate the original array', function () {
    const array = Array.from(range(0, 100))
    const copy = Array.from(array)
    shuffle(copy)
    assert.deepEqual(copy, array)
  })
})

describe('schwartzSort function', function () {
  it('sorts a shuffled array', function () {
    const array = [1, 3, 15, -7, 4]
    const result = [-7, 1, 3, 4, 15]
    assert.deepEqual(schwartzSort(x => x, array), result)
  })

  it('sorts a shuffled array backwards', function () {
    const array = [1, 3, 15, -7, 4]
    const result = [15, 4, 3, 1, -7]
    assert.deepEqual(schwartzSort(x => -x, array), result)
  })
})
