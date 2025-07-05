import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { flatten, range, reduce } from './base.ts'
import { EmptyIterError } from './errors.ts'

describe('reduce function', function () {
  it("doesn't throw when trying to reduce nothing with a default value", function () {
    assert.doesNotThrow(() => reduce(Boolean, [], true), EmptyIterError)
  })

  it('correctly sums an array of values', function () {
    assert.equal(reduce((a, b) => a + b, range(5), 0), 10)
  })
})

describe('flatten function', function () {
  it('flattens a flat array', function () {
    const flattened = flatten([1, 2, 3])
    assert.deepEqual(Array.from(flattened), [1, 2, 3])
  })

  it('flattens a nested array', function () {
    const flattened = flatten([[1, 2], [3, 4], [5, 6]])
    assert.deepEqual(Array.from(flattened), [1, 2, 3, 4, 5, 6])
  })

  it('flattens a double nested array', function () {
    const flattened = flatten([[[1, 2], [3, 4]], [[5, 6], [7, 8]]])
    assert.deepEqual(Array.from(flattened), [1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('flattens an array with different levels of nesting', function () {
    const flattened = flatten([1, 2, [3, 4], [[5, 6], [7, 8]]])
    assert.deepEqual(Array.from(flattened), [1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('does not split strings', function () {
    const flattened = flatten(['a', 'bc', ['def']])
    assert.deepEqual(Array.from(flattened), ['a', 'bc', 'def'])
  })
})
