import { isSameNumber } from '../numeric/floating.js'
import { MathError } from '../errors.js'
import { float64, UnitRatio } from '../../types/numeric.js'

class VectorError extends MathError {}
class ZeroVectorError extends VectorError {}

export interface VectorParams {
  x: float64
  y: float64
}

export interface Vector extends VectorParams {}
export class Vector {
  static fromPolar(length: float64, angle: float64) {
    return new this({
      x: length * Math.cos(angle),
      y: length * Math.sin(angle)
    })
  }

  constructor(params: VectorParams) {
    Object.assign(this, params)
  }

  add(other: Vector) {
    return new Vector({ x: this.x + other.x, y: this.y + other.y })
  }

  sub(other: Vector) {
    return new Vector({ x: this.x - other.x, y: this.y - other.y })
  }

  scale(amount: float64) {
    return new Vector({ x: amount * this.x, y: amount * this.y })
  }

  scaleToNormed() {
    if (this.isZeroVector()) {
      throw new ZeroVectorError('Cannot scale the zero vector to a normed vector')
    }

    return this.scale(1 / this.getNorm())
  }

  getNorm() {
    return Math.sqrt(this.x ** 2 + this.y ** 2)
  }

  distanceTo(other: Vector) {
    return this.sub(other).getNorm()
  }

  isZeroVector() {
    return isSameNumber(this.x, 0) && isSameNumber(this.y, 0)
  }

  isUnidirectionalWith(other: Vector) {
    return isSameNumber(this.scaleToNormed().distanceTo(other.scaleToNormed()), 0)
  }

  convexSum(other: Vector, coeff: UnitRatio) {
    return new Vector({
      x: this.x * coeff + other.x * (1 - coeff),
      y: this.y * coeff + other.y * (1 - coeff)
    })
  }
}
