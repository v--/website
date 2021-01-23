import { describe, it, assert, assertSameNumber } from '../../../_common.js'

import { sort } from '../../../../code/common/support/iteration.js'
import { Polynomial, ZeroPolynomialError } from '../../../../code/common/math/algebra/polynomial.js'
import { numericallyFindRoots } from '../../../../code/common/math/algebra/polynomial_roots.js'

describe('numericallyFindRoots()', function() {
  it('throws when trying to find roots of a zero polynomial', function() {
    assert.throws(function() {
      numericallyFindRoots(Polynomial.ZERO)
    }, ZeroPolynomialError)
  })

  it('finds no roots for a constant polynomial', function() {
    const p = new Polynomial({ coef: [3] })
    assert.isEmpty(numericallyFindRoots(p))
  })

  it('finds the sole root of a linear polynomial', function() {
    const p = new Polynomial({ coef: [1, 1] })
    const rootSet = numericallyFindRoots(p)
    const roots = sort(rootSet)
    assert.lengthOf(roots, 1)
    assertSameNumber(roots[0], -1)
  })

  it('finds the roots of a quadratic polynomial with real roots', function() {
    const p = new Polynomial({ coef: [-1, 0, 1] })
    const rootSet = numericallyFindRoots(p)
    const roots = sort(rootSet)
    assert.lengthOf(roots, 2)
    assertSameNumber(roots[0], -1)
    assertSameNumber(roots[1], 1)
  })

  it('finds the sole real root of a quadratic polynomial', function() {
    const p = new Polynomial({ coef: [1, 2, 1] })
    const rootSet = numericallyFindRoots(p)
    const roots = sort(rootSet)
    assert.lengthOf(roots, 1)
    assert.closeTo(roots[0], -1, 1e-3)
  })

  it('finds the zero real roots of a quadratic polynomial', function() {
    const p = new Polynomial({ coef: [1, 0, 1] })
    const rootSet = numericallyFindRoots(p)
    assert.isEmpty(rootSet)
  })

  it('finds all real roots of the 4-degree Wilkinson polynomial', function() {
    let p = new Polynomial({ coef: [1] })

    for (let x = 1; x <= 4; x++) {
      p = p.mult(new Polynomial({ coef: [-x, 1] }))
    }

    const rootSet = numericallyFindRoots(p)
    const roots = sort(rootSet)
    assert.lengthOf(roots, 4)

    for (let x = 1; x <= 4; x++) {
      assertSameNumber(roots[x - 1], x)
    }
  })
})
