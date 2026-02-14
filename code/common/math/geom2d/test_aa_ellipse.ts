import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { AAEllipse } from './aa_ellipse.ts'
import { Vec2D } from './vec2d.ts'
import { ConvergenceError } from '../numeric.ts'

describe('AAEllipse class', function () {
  describe('nearestPoint method', function () {
    it('terminates for all directions', function () {
      const ellipse = new AAEllipse({ x0: 0, y0: 0, a: 3, b: 1 })

      for (let angle = 0; angle < 2 * Math.PI; angle += 0.1) {
        const point = Vec2D.fromPolar(4, angle)

        assert.doesNotThrow(
          () => ellipse.nearestPoint(point),
          ConvergenceError,
        )
      }
    })
  })
})
