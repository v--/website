import { assert } from '../../../_common.js'

import dividedDifferences, { NoPointsError, DuplicatePointsError } from '../../../../code/client/curve_fitting/support/divided_differences.js'

describe('dividedDifferences()', function () {
  it('fails when passed no points', function () {
    assert.throws(function () {
      dividedDifferences(Math.cos, [])
    }, NoPointsError)
  })

  it('fails when passed identical points', function () {
    assert.throws(function () {
      dividedDifferences(Math.cos, [1, 2, 3, 1, 4, 5])
    }, DuplicatePointsError)
  })

  it('evaluates the function at a single point', function () {
    const d = dividedDifferences(Math.cos, [0])
    assert.closeTo(d, 1, 1e-3)
  })

  it('evaluates the function at a two different points', function () {
    const d = dividedDifferences(Math.cos, [0, Math.PI])
    assert.closeTo(d, -2 / Math.PI, 1e-3)
  })

  it('is additive', function () {
    const d = dividedDifferences(x => Math.cos(x) + Math.sin(x), [1, 2])
    const d1 = dividedDifferences(Math.cos, [1, 2])
    const d2 = dividedDifferences(Math.sin, [1, 2])
    assert.closeTo(d, d1 + d2, 1e-3)
  })

  it('is homogeneous', function () {
    const d1 = dividedDifferences(x => 13 * Math.cos(x), [1, 2])
    const d2 = 13 * dividedDifferences(Math.cos, [1, 2])
    assert.closeTo(d1, d2, 1e-3)
  })

  it('is invariant under point permutations', function () {
    const d1 = dividedDifferences(Math.cos, [1, 2, 3])
    const d2 = dividedDifferences(Math.cos, [3, 2, 1])
    assert.closeTo(d1, d2, 1e-3)
  })
})
