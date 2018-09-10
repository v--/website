/* globals describe it */

import { expect } from '../../../_common.mjs'

import dividedDifferences, { NoPointsError, DuplicatePointsError } from '../../../../code/client/curve_fitting/support/divided_differences.mjs'

describe('dividedDifferences', function () {
  it('fails when passed no points', function () {
    expect(function () {
      dividedDifferences(Math.cos, [])
    }).to.throw(NoPointsError)
  })

  it('fails when passed identical points', function () {
    expect(function () {
      dividedDifferences(Math.cos, [1, 2, 3, 1, 4, 5])
    }).to.throw(DuplicatePointsError)
  })

  it('evaluates the function at a single point', function () {
    const d = dividedDifferences(Math.cos, [0])
    expect(d).to.be.closeTo(1, 1e-3)
  })

  it('evaluates the function at a two different points', function () {
    const d = dividedDifferences(Math.cos, [0, Math.PI])
    expect(d).to.be.closeTo(-2 / Math.PI, 1e-3)
  })

  it('is additive', function () {
    const d = dividedDifferences(x => Math.cos(x) + Math.sin(x), [1, 2])
    const d1 = dividedDifferences(Math.cos, [1, 2])
    const d2 = dividedDifferences(Math.sin, [1, 2])
    expect(d).to.be.closeTo(d1 + d2, 1e-3)
  })

  it('is homogeneous', function () {
    const d1 = dividedDifferences(x => 13 * Math.cos(x), [1, 2])
    const d2 = 13 * dividedDifferences(Math.cos, [1, 2])
    expect(d1).to.be.closeTo(d2, 1e-3)
  })

  it('is invariant under point permutations', function () {
    const d1 = dividedDifferences(Math.cos, [1, 2, 3])
    const d2 = dividedDifferences(Math.cos, [3, 2, 1])
    expect(d1).to.be.closeTo(d2, 1e-3)
  })
})
