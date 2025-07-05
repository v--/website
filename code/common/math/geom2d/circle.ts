import { type IPlainVec2D, Vec2D } from './vec2d.ts'
import { isLeq } from '../../support/floating.ts'
import { type float64 } from '../../types/numbers.ts'

export interface ICircleConfig {
  x0: float64
  y0: float64
  r: float64
}

export class Circle implements ICircleConfig {
  x0: float64
  y0: float64
  r: float64

  constructor({ x0, y0, r }: ICircleConfig) {
    this.x0 = x0
    this.y0 = y0
    this.r = r
  }

  getCenter(): Vec2D {
    return new Vec2D({ x: this.x0, y: this.y0 })
  }

  containsPoint(point: IPlainVec2D, tolerance?: float64): boolean {
    const dist = this.getCenter().distanceTo(point)
    return isLeq(dist, this.r, tolerance)
  }
}
