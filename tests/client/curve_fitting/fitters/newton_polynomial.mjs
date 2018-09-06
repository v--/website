/* globals describe it */

import { expect } from '../../../../code/tests'

import newtonPolynomial from '../../../../code/client/curve_fitting/fitters/newton_polynomial'

function quadraticTest (x) {
  return x ** 2 + 13
}

describe('newtonPolynomial', function () {
  it('returns the zero polynomial when given no points', function () {
    const p = newtonPolynomial.fit(quadraticTest, [])
    expect(String(p)).to.equal('0')
  })

  it('interpolates a single point', function () {
    const p = newtonPolynomial.fit(quadraticTest, [0])
    expect(String(p)).to.equal('13')
  })

  it('interpolates two points', function () {
    const p = newtonPolynomial.fit(quadraticTest, [0, 10])
    expect(String(p)).to.equal('10x + 13')
  })

  it('interpolates three points', function () {
    const p = newtonPolynomial.fit(quadraticTest, [0, 1, 2])
    expect(String(p)).to.equal('x^2 + 13')
  })

  it('interpolates four points', function () {
    const p = newtonPolynomial.fit(quadraticTest, [0, 1, 2, 3])
    expect(String(p)).to.equal('x^2 + 13')
  })
})
