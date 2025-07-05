import { describe, it } from 'node:test'

import { UnivariatePolynomial, ZERO_POLYNOMIAL } from '../../../common/math/algebra/univariate_polynomial.ts'
import { KnotMapping, constructNewtonUnivariatePolynomial } from '../../../common/math/numeric.ts'
import { type float64 } from '../../../common/types/numbers.ts'
import { assertCustomEqual } from '../../../testing/assertion.ts'

function quadraticTestFunction(x: float64) {
  return x ** 2 + 13
}

function createTestMapping(domain: float64[]): KnotMapping {
  return new KnotMapping(domain.map(x => ({ x, y: quadraticTestFunction(x) })))
}

describe('newtonUnivariatePolynomial function', function () {
  it('returns the zero polynomial when given no points', function () {
    const p = constructNewtonUnivariatePolynomial(createTestMapping([]))
    assertCustomEqual(p, ZERO_POLYNOMIAL)
  })

  it('interpolates a single point', function () {
    const p = constructNewtonUnivariatePolynomial(createTestMapping([0]))
    assertCustomEqual(p, new UnivariatePolynomial({ coeff: [13] }))
  })

  it('interpolates two points', function () {
    const p = constructNewtonUnivariatePolynomial(createTestMapping([0, 1]))
    assertCustomEqual(p, new UnivariatePolynomial({ coeff: [13, 1] }))
  })

  it('interpolates three points', function () {
    const p = constructNewtonUnivariatePolynomial(createTestMapping([0, 1, 2]))
    assertCustomEqual(p, new UnivariatePolynomial({ coeff: [13, 0, 1] }))
  })

  it('interpolates four points', function () {
    const p = constructNewtonUnivariatePolynomial(createTestMapping([0, 1, 2, 3]))
    assertCustomEqual(p, new UnivariatePolynomial({ coeff: [13, 0, 1] }))
  })
})
