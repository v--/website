import { describe, it, assert } from '../../../_common.js'

import { NumericMapping } from '../../../../code/client/curve_fitting/support/numeric_mapping.js'
import { newtonPolynomial } from '../../../../code/client/curve_fitting/fitters/newton_polynomial.js'

function quadraticTest (x) {
  return x ** 2 + 13
}

function createTestMapping (domain) {
  return new NumericMapping(domain.map(x => [x, quadraticTest(x)]))
}

describe('newtonPolynomial()', function () {
  it('returns the zero polynomial when given no points', function () {
    const p = newtonPolynomial.fit(createTestMapping([]))
    assert.equal(String(p), '0')
  })

  it('interpolates a single point', function () {
    const p = newtonPolynomial.fit(createTestMapping([0]))
    assert.equal(String(p), '13')
  })

  it('interpolates two points', function () {
    const p = newtonPolynomial.fit(createTestMapping([0, 1]))
    assert.equal(String(p), 'x + 13')
  })

  it('interpolates three points', function () {
    const p = newtonPolynomial.fit(createTestMapping([0, 1, 2]))
    assert.equal(String(p), 'x^2 + 13')
  })

  it('interpolates four points', function () {
    const p = newtonPolynomial.fit(createTestMapping([0, 1, 2, 3]))
    assert.equal(String(p), 'x^2 + 13')
  })
})
