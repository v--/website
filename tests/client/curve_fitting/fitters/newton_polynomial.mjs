/* globals describe it */

import { expect } from '../../../_common.mjs'

import { DiscreteMap } from '../../../../code/client/curve_fitting/support/grid_observable.mjs'
import newtonPolynomial from '../../../../code/client/curve_fitting/fitters/newton_polynomial.mjs'

function quadraticTest (x) {
  return x ** 2 + 13
}

function createTestMapping (domain) {
  return new DiscreteMap(domain.map(x => [x, quadraticTest(x)]))
}

describe('newtonPolynomial', function () {
  it('returns the zero polynomial when given no points', function () {
    const p = newtonPolynomial.fit(createTestMapping([]))
    expect(String(p)).to.equal('0')
  })

  it('interpolates a single point', function () {
    const p = newtonPolynomial.fit(createTestMapping([0]))
    expect(String(p)).to.equal('13')
  })

  it('interpolates two points', function () {
    const p = newtonPolynomial.fit(createTestMapping([0, 1]))
    expect(String(p)).to.equal('x + 13')
  })

  it('interpolates three points', function () {
    const p = newtonPolynomial.fit(createTestMapping([0, 1, 2]))
    expect(String(p)).to.equal('x^2 + 13')
  })

  it('interpolates four points', function () {
    const p = newtonPolynomial.fit(createTestMapping([0, 1, 2, 3]))
    expect(String(p)).to.equal('x^2 + 13')
  })
})
