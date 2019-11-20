import { isSameNumber } from '../numeric/floating.js'
import { MathError } from '../errors.js'

class VectorError extends MathError {}
class ZeroVectorError extends VectorError {}

export class Vector {
  static fromPolar (length, angle) {
    return new this(
      length * Math.cos(angle),
      length * Math.sin(angle)
    )
  }

  constructor (x, y) {
    this.x = x
    this.y = y
  }

  add (other) {
    return new Vector(this.x + other.x, this.y + other.y)
  }

  sub (other) {
    return new Vector(this.x - other.x, this.y - other.y)
  }

  scale (amount) {
    return new Vector(amount * this.x, amount * this.y)
  }

  scaleToNormed () {
    const norm = this.getNorm()

    if (isSameNumber(norm, 0)) {
      throw new ZeroVectorError('Cannot scale the zero vector to a normed vector')
    }

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

  convexSum (other, coeff) {
    return new Vector(
      this.x * coeff + other.x * (1 - coeff),
      this.y * coeff + other.y * (1 - coeff)
    )
  }
}
