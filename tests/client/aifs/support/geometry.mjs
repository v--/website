/* globals describe it */

import { expect } from '../../../_common.mjs'

import { Vector, Rect, AffineTransform } from '../../../../code/client/aifs/support/geometry.mjs'

describe('Vector', function () {
  describe('.add()', function () {
    it('works', function () {
      const a = new Vector(2, 3)
      const b = new Vector(4, 5)
      expect(a.add(b)).to.deep.equal(new Vector(6, 8))
    })
  })

  describe('.innerProduct()', function () {
    it('works', function () {
      const a = new Vector(2, 3)
      const b = new Vector(4, 5)
      expect(a.innerProduct(b)).to.equal(23)
    })
  })

  describe('.positiveAngle', function () {
    it('is zero for (0, 0)', function () {
      const vec = new Vector(0, 0)
      expect(vec.positiveAngle).to.be.closeTo(0, 1e-3)
    })

    it('is zero for (x, 0) where x > 0', function () {
      const vec = new Vector(2, 0)
      expect(vec.positiveAngle).to.be.closeTo(0, 1e-3)
    })

    it('is PI/2 for (0, y) where y > 0', function () {
      const vec = new Vector(0, 2)
      expect(vec.positiveAngle).to.be.closeTo(Math.PI / 2, 1e-3)
    })

    it('is PI/4 for (x, y) where x = y > 0', function () {
      const vec = new Vector(2, 2)
      expect(vec.positiveAngle).to.be.closeTo(Math.PI / 4, 1e-3)
    })

    it('is PI for (x, 0) where x < 0', function () {
      const vec = new Vector(-2, 0)
      expect(vec.positiveAngle).to.be.closeTo(Math.PI, 1e-3)
    })

    it('is PI/2 for (0, y) where y < 0', function () {
      const vec = new Vector(0, -2)
      expect(vec.positiveAngle).to.be.closeTo(Math.PI / 2, 1e-3)
    })

    it('is PI/4 for (x, y) where x = y < 0', function () {
      const vec = new Vector(-2, -2)
      expect(vec.positiveAngle).to.be.closeTo(3 / 4 * Math.PI, 1e-3)
    })
  })
})

describe('Rect', function () {
  describe('.positiveAngle', function () {
    it('is zero for a square with zero rotation', function () {
      const rect = new Rect(
        new Vector(1, 1),
        new Vector(2, 1),
        new Vector(2, 2),
        new Vector(1, 2)
      )

      expect(rect.positiveAngle).to.be.closeTo(0, 1e-3)
    })

    it('is zero for a square with a PI/2 rotation', function () {
      const rect = new Rect(
        new Vector(1, 2),
        new Vector(1, 1),
        new Vector(2, 1),
        new Vector(2, 2)
      )

      expect(rect.positiveAngle).to.be.closeTo(0, 1e-3)
    })

    it('is PI/4 for a square with a PI/4 rotation', function () {
      const rect = new Rect(
        new Vector(1, 2),
        new Vector(2, 3),
        new Vector(3, 2),
        new Vector(2, 1)
      )

      expect(rect.positiveAngle).to.be.closeTo(Math.PI / 4, 1e-3)
    })
  })
})

describe('AffineTransform', function () {
  describe('.transformVector()', function () {
    it('works with identity transformations', function () {
      const vec = new Vector(2, 3)
      const t = new AffineTransform(
        new Vector(1, 0),
        new Vector(0, 1),
        new Vector(0, 0)
      )

      expect(t.transformVector(vec)).to.deep.equal(vec)
    })

    it('works with reflection transformations', function () {
      const vec = new Vector(2, 3)
      const t = new AffineTransform(
        new Vector(0, 1),
        new Vector(1, 0),
        new Vector(0, 0)
      )

      expect(t.transformVector(vec)).to.deep.equal(new Vector(3, 2))
    })

    it('works with rotation transformations', function () {
      const vec = new Vector(2, 3)
      const t = new AffineTransform(
        new Vector(1, 1),
        new Vector(1, 1),
        new Vector(0, 0)
      )

      expect(t.transformVector(vec)).to.deep.equal(new Vector(5, 5))
    })

    it('works with truly affine transformations', function () {
      const vec = new Vector(2, 3)
      const t = new AffineTransform(
        new Vector(0, 1),
        new Vector(1, 0),
        new Vector(4, 5)
      )

      expect(t.transformVector(vec)).to.deep.equal(new Vector(7, 7))
    })
  })
})
