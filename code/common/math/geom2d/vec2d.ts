import { ZeroVec2DError } from './errors.ts'
import { isClose, mod } from '../../support/floating.ts'
import { type UnitRatio, type float64 } from '../../types/numbers.ts'

export interface IPlainVec2D {
  x: float64
  y: float64
}

export type IVec2DConfig = IPlainVec2D

export class Vec2D implements IPlainVec2D {
  readonly x: float64
  readonly y: float64

  static fromPolar(length: float64, angle: float64) {
    return new this({
      x: length * Math.cos(angle),
      y: length * Math.sin(angle),
    })
  }

  constructor({ x, y }: IVec2DConfig) {
    this.x = x
    this.y = y
  }

  translate(direction: IPlainVec2D, distance: float64) {
    return new Vec2D({
      x: this.x + distance * direction.x,
      y: this.y + distance * direction.y,
    })
  }

  rotate(angle: float64) {
    return new Vec2D({
      x: Math.cos(angle) * this.x - Math.sin(angle) * this.y,
      y: Math.sin(angle) * this.x + Math.cos(angle) * this.y,
    })
  }

  add(other: IPlainVec2D) {
    return new Vec2D({ x: this.x + other.x, y: this.y + other.y })
  }

  sub(other: IPlainVec2D) {
    return new Vec2D({ x: this.x - other.x, y: this.y - other.y })
  }

  scalarProduct(other: IPlainVec2D) {
    return Math.sqrt(
      (this.x * other.x) ** 2 + (other.y * this.y) ** 2,
    )
  }

  scaleBy(scalar: float64) {
    return new Vec2D({
      x: scalar * this.x,
      y: scalar * this.y,
    })
  }

  scaleToNormed() {
    if (this.isZeroVector()) {
      throw new ZeroVec2DError('Cannot scale the zero vector to a normed vector')
    }

    return this.scaleBy(1 / this.getNorm())
  }

  getAngle(): float64 {
    return mod(Math.atan2(this.y, this.x), 2 * Math.PI)
  }

  getNorm() {
    return Math.sqrt(this.x ** 2 + this.y ** 2)
  }

  distanceTo(other: IPlainVec2D) {
    return this.sub(other).getNorm()
  }

  isZeroVector(tolerance?: float64) {
    return isClose(this.x, 0, tolerance) && isClose(this.y, 0, tolerance)
  }

  equals(other: Vec2D, tolerance?: float64) {
    return isClose(this.x, other.x, tolerance) && isClose(this.y, other.y, tolerance)
  }

  coincidesWith(other: Vec2D, tolerance?: float64) {
    return isClose(this.distanceTo(other), 0, tolerance)
  }

  isUnidirectionalWith(other: Vec2D, tolerance?: float64) {
    return this.scaleToNormed().coincidesWith(other.scaleToNormed(), tolerance)
  }

  convexSum(other: Vec2D, coeff: UnitRatio) {
    return new Vec2D({
      x: this.x * coeff + other.x * (1 - coeff),
      y: this.y * coeff + other.y * (1 - coeff),
    })
  }
}

export const ZERO_VECTOR = new Vec2D({ x: 0, y: 0 })
