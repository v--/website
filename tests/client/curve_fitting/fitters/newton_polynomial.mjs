/* globals describe it */

import { expect } from '../../../../code/tests'

import { NoPointsError } from '../../../../code/client/curve_fitting/errors'
import newtonPolynomial from '../../../../code/client/curve_fitting/fitters/newton_polynomial'

function quadraticTest (x) {
  return x ** 2 + 13
}

describe('newtonPolynomial', function () {
  it('fails when passed no points', function () {
    expect(function () {
      newtonPolynomial.fit(quadraticTest, [])
    }).to.throw(NoPointsError)
  })

  it('interpolates a single point', function () {
    var p = newtonPolynomial.fit(quadraticTest, [0])
    expect(String(p)).to.equal('13')
  })

  it('interpolates two points', function () {
    var p = newtonPolynomial.fit(quadraticTest, [0, 10])
    expect(String(p)).to.equal('10x + 13')
  })

  it('interpolates three points', function () {
    var p = newtonPolynomial.fit(quadraticTest, [0, 1, 2])
    expect(String(p)).to.equal('x^2 + 13')
  })

  it('interpolates four points', function () {
    var p = newtonPolynomial.fit(quadraticTest, [0, 1, 2, 3])
    expect(String(p)).to.equal('x^2 + 13')
  })
})
