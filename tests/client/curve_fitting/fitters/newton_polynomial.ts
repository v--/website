import { describe, it, assert } from '../../../_common.js'

import { newtonPolynomial } from '../../../../code/client/curve_fitting/fitters/newton_polynomial.js'
import { float64 } from '../../../../code/types/common/numeric.js'

function quadraticTest(x: float64) {
  return x ** 2 + 13
}

function createTestMapping(domain: float64[]) {
  return new Map(domain.map(x => [x, quadraticTest(x)]))
}

describe('newtonPolynomial()', function() {
  it('returns the zero polynomial when given no points', function() {
    const p = newtonPolynomial.fit(createTestMapping([]))
    assert.equal(String(p), '0')
  })

  it('interpolates a single point', function() {
    const p = newtonPolynomial.fit(createTestMapping([0]))
    assert.equal(String(p), '13')
  })

  it('interpolates two points', function() {
    const p = newtonPolynomial.fit(createTestMapping([0, 1]))
    assert.equal(String(p), 'x + 13')
  })

  it('interpolates three points', function() {
    const p = newtonPolynomial.fit(createTestMapping([0, 1, 2]))
    assert.equal(String(p), 'x^2 + 13')
  })

  it('interpolates four points', function() {
    const p = newtonPolynomial.fit(createTestMapping([0, 1, 2, 3]))
    assert.equal(String(p), 'x^2 + 13')
  })
})
