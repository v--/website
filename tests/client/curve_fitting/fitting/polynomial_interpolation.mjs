/* globals describe it */

import { expect } from '../../../../code/tests'

import { NoPointsError } from '../../../../code/client/curve_fitting/errors'
import polynomialInterpolation from '../../../../code/client/curve_fitting/fitting/polynomial_interpolation'

function quadraticTest (x) {
  return x ** 2 + 13
}

describe('polynomialInterpolation', function () {
  it('fails when passed no points', function () {
    expect(function () {
      polynomialInterpolation(quadraticTest, [])
    }).to.throw(NoPointsError)
  })

  it('interpolates a single point', function () {
    var p = polynomialInterpolation(quadraticTest, [0])
    expect(String(p)).to.equal('13')
  })

  it('interpolates two points', function () {
    var p = polynomialInterpolation(quadraticTest, [0, 10])
    expect(String(p)).to.equal('10x + 13')
  })

  it('interpolates three points', function () {
    var p = polynomialInterpolation(quadraticTest, [0, 1, 2])
    expect(String(p)).to.equal('x^2 + 13')
  })

  it('interpolates four points', function () {
    var p = polynomialInterpolation(quadraticTest, [0, 1, 2, 3])
    expect(String(p)).to.equal('x^2 + 13')
  })
})
