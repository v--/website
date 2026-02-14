import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { ConvergenceError } from './errors.ts'
import { newtonRaphsonMin } from './newton_raphson.ts'
import { assertSameNumber } from '../../../testing/assertion.ts'
import { type float64 } from '../../types/numbers.ts'

describe('newtonRaphsonMin function', function () {
  describe('for sin(x)', function () {
    function f(x: float64) {
      return {
        functionValue: Math.sin(x),
        derivativeValue: Math.cos(x),
      }
    }

    it('succeeds with initial guess 0', function () {
      const min = newtonRaphsonMin(f, 0)
      assertSameNumber(min, 0)
    })

    it('succeeds with initial guess 1', function () {
      const min = newtonRaphsonMin(f, 1)
      assertSameNumber(min, 0)
    })

    it('succeeds with initial guess 2', function () {
      const min = newtonRaphsonMin(f, 2)
      assertSameNumber(min, Math.PI)
    })

    it('fails with initial guess π/2 (where cos(x) is zero)', function () {
      assert.throws(
        function () {
          newtonRaphsonMin(f, Math.PI / 2)
        },
        ConvergenceError,
      )
    })
  })

  it('fails to minimize exp(x) with initial guess 0', function () {
    function f(x: float64) {
      return {
        functionValue: Math.exp(x),
        derivativeValue: Math.exp(x),
      }
    }

    assert.throws(
      function () {
        newtonRaphsonMin(f, 0)
      },
      ConvergenceError,
    )
  })
})
