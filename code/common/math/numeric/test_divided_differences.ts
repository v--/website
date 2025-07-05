import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { dividedDifferences } from './divided_differences.ts'
import { KnotExistenceError, KnotUniquenessError } from './errors.ts'
import { assertSameNumber } from '../../../testing/assertion.ts'

describe('dividedDifferences function', function () {
  it('fails when passed no points', function () {
    assert.throws(
      function () {
        dividedDifferences(Math.cos, [])
      },
      KnotExistenceError,
    )
  })

  it('fails when passed identical points', function () {
    assert.throws(
      function () {
        dividedDifferences(Math.cos, [1, 2, 3, 1, 4, 5])
      },
      KnotUniquenessError,
    )
  })

  it('evaluates the function at a single point', function () {
    const d = dividedDifferences(Math.cos, [0])
    assertSameNumber(d, 1)
  })

  it('evaluates the function at a two different points', function () {
    const d = dividedDifferences(Math.cos, [0, Math.PI])
    assertSameNumber(d, -2 / Math.PI)
  })

  it('is additive', function () {
    const d = dividedDifferences(x => Math.cos(x) + Math.sin(x), [1, 2])
    const d1 = dividedDifferences(Math.cos, [1, 2])
    const d2 = dividedDifferences(Math.sin, [1, 2])
    assertSameNumber(d, d1 + d2)
  })

  it('is homogeneous', function () {
    const d1 = dividedDifferences(x => 13 * Math.cos(x), [1, 2])
    const d2 = 13 * dividedDifferences(Math.cos, [1, 2])
    assertSameNumber(d1, d2)
  })

  it('is invariant under point permutations', function () {
    const d1 = dividedDifferences(Math.cos, [1, 2, 3])
    const d2 = dividedDifferences(Math.cos, [3, 2, 1])
    assertSameNumber(d1, d2)
  })
})
