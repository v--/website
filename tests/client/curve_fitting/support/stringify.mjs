/* globals describe it */

import { expect } from '../../../_common.mjs'

import { stringifyNumber as sn, stringifyLinearCombination as slc, StringifyError } from '../../../../code/client/curve_fitting/support/stringify.mjs'

describe.only('stringifyNumber()', function () {
  it('preserves integers', function () {
    expect(sn(1)).to.equal('1')
  })

  it('preserves exact floats', function () {
    expect(sn(1 / 2)).to.equal('0.5')
  })

  it('rounds inexact floats', function () {
    expect(sn(2 / 3)).to.equal('0.6667')
  })

  it('handles small floats', function () {
    expect(sn(0.000012)).to.equal('1e-5')
  })

  it('handles very small floats', function () {
    expect(sn(0.000000037)).to.equal('4e-8')
  })

  it('handles very large floats', function () {
    expect(sn(374123.35232)).to.equal('374123.3523')
  })
})

describe('stringifyLinearCombination()', function () {
  it('returns zero when no data is passed', function () {
    expect(slc([], [])).to.equal('0')
  })

  it('throws on coefficient and value dimension mismatch', function () {
    expect(function () {
      slc([], [1])
    }).to.throw(StringifyError)
  })

  it('handles the zero polynomial', function () {
    expect(slc([0], 'x')).to.equal('0')
  })

  it('handles the unit polynomial', function () {
    expect(slc([1], 'x')).to.equal('x')
  })

  it('handles the negative unit polynomial', function () {
    expect(slc([-1], 'x')).to.equal('-x')
  })

  it('handles linear polynomials', function () {
    expect(slc([42], 'x')).to.equal('42x')
  })

  it('handles negative linear polynomials', function () {
    expect(slc([-42], 'x')).to.equal('-42x')
  })

  it('handles quadratic polynomials', function () {
    expect(slc([1, 2, 3], ['x^2', 'x', ''])).to.equal('x^2 + 2x + 3')
  })

  it('handles quadratic polynomials with varying signs', function () {
    expect(slc([-3, 3, -3], ['x^2', 'x', ''])).to.equal('-3x^2 + 3x - 3')
  })

  it('handles cubic mononomials', function () {
    expect(slc([1, 0, 0, 0], ['x^3', 'x^2', 'x', ''])).to.equal('x^3')
  })
})
