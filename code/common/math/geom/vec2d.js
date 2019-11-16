import { isSameNumber } from '../../../common/math/numeric/floating.js'

export class Vec2d {
  constructor (x, y) {
    this.x = x
    this.y = y
  }

  add (other) {
    return new Vec2d(this.x + other.x, this.y + other.y)
  }

  sub (other) {
    return new Vec2d(this.x - other.x, this.y - other.y)
  }

  scale (amount) {
    return new Vec2d(amount * this.x, amount * this.y)
  }

  scaleToNormed () {
    return this.scale(1 / this.getNorm())
  }

  getNorm () {
    return Math.sqrt(this.x ** 2 + this.y ** 2)
  }

  distanceTo (other) {
    return this.sub(other).getNorm()
  }

  isUnidirectionalWith (other) {
    return isSameNumber(this.scaleToNormed().distanceTo(other.scaleToNormed()), 0)
  }
}
