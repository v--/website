import { assert } from '../../../_common.js'

import { stringifyNumber as sn, stringifyLinearCombination as slc, StringifyError } from '../../../../code/client/curve_fitting/support/stringify.js'

describe('stringifyNumber()', function () {
  it('preserves integers', function () {
    assert.equal(sn(1), '1')
  })

  it('preserves exact floats', function () {
    assert.equal(sn(1 / 2), '0.5')
  })

  it('rounds inexact floats', function () {
    assert.equal(sn(2 / 3), '0.6667')
  })

  it('handles small floats', function () {
    assert.equal(sn(0.000012), '1e-5')
  })

  it('handles very small floats', function () {
    assert.equal(sn(0.000000037), '4e-8')
  })

  it('handles very large floats', function () {
    assert.equal(sn(374123.35232), '374123.3523')
  })
})

describe('stringifyLinearCombination()', function () {
  it('returns zero when no data is passed', function () {
    assert.equal(slc([], []), '0')
  })

  it('throws on coefficient and value dimension mismatch', function () {
    assert.throws(function () {
      slc([], [1])
    }, StringifyError)
  })

  it('handles the zero polynomial', function () {
    assert.equal(slc([0], 'x'), '0')
  })

  it('handles the unit polynomial', function () {
    assert.equal(slc([1], 'x'), 'x')
  })

  it('handles the negative unit polynomial', function () {
    assert.equal(slc([-1], 'x'), '-x')
  })

  it('handles linear polynomials', function () {
    assert.equal(slc([42], 'x'), '42x')
  })

  it('handles negative linear polynomials', function () {
    assert.equal(slc([-42], 'x'), '-42x')
  })

  it('handles quadratic polynomials', function () {
    assert.equal(slc([1, 2, 3], ['x^2', 'x', '']), 'x^2 + 2x + 3')
  })

  it('handles quadratic polynomials with varying signs', function () {
    assert.equal(slc([-3, 3, -3], ['x^2', 'x', '']), '-3x^2 + 3x - 3')
  })

  it('handles cubic mononomials', function () {
    assert.equal(slc([1, 0, 0, 0], ['x^3', 'x^2', 'x', '']), 'x^3')
  })
})
