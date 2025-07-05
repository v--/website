import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { stringifyNumber } from './floating.ts'

describe('stringifyNumber function', function () {
  it('preserves integers', function () {
    assert.equal(stringifyNumber(1), '1')
  })

  it('preserves exact floats', function () {
    assert.equal(stringifyNumber(1 / 2), '0.5')
  })

  it('rounds inexact floats', function () {
    assert.equal(stringifyNumber(2 / 3), '0.667')
  })

  it('rounds 0.1 + 0.2 as 0.3', function () {
    // And not naively as 0.30000000000000004
    assert.equal(stringifyNumber(0.1 + 0.2), '0.3')
  })

  it('handles small floats', function () {
    assert.equal(stringifyNumber(0.000012), '1e-5')
  })

  it('handles very small floats', function () {
    assert.equal(stringifyNumber(0.000000037), '4e-8')
  })

  it('handles very large floats', function () {
    assert.equal(stringifyNumber(374123.35232), '374123.352')
  })
})
