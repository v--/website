import { Line2D } from './line2d.ts'
import { type IIntersectible, type IIntersection } from './types.ts'
import { type IPlainVec2D, Vec2D } from './vec2d.ts'
import { isGeq, isLeq } from '../../support/floating.ts'
import { schwartzMin } from '../../support/iteration.ts'
import { type float64 } from '../../types/numbers.ts'

export interface IAARectConfig {
  width: float64
  height: float64
  x: float64
  y: float64
}

/**
 * An axis-aligned rectangle
 */
export class AARect implements IAARectConfig, IIntersectible {
  readonly width: float64
  readonly height: float64
  readonly x: float64
  readonly y: float64

  constructor({ width, height, x, y }: IAARectConfig) {
    this.width = width
    this.height = height
    this.x = x
    this.y = y
  }

  getLeftPos() {
    return this.x
  }

  getRightPos() {
    return this.x + this.width
  }

  getTopPos() {
    return this.y
  }

  getBottomPos() {
    return this.y + this.height
  }

  getCenter() {
    return new Vec2D({
      x: this.getLeftPos() + this.width / 2,
      y: this.getTopPos() + this.height / 2,
    })
  }

  fits(other: AARect, tolerance?: float64) {
    return isLeq(this.getLeftPos(), other.getLeftPos(), tolerance) &&
      isGeq(this.getRightPos(), other.getRightPos(), tolerance) &&
      isLeq(this.getTopPos(), other.getTopPos(), tolerance) &&
      isGeq(this.getBottomPos(), other.getBottomPos(), tolerance)
  }

  * iterEdges() {
    yield new Line2D({ a: 0, b: -1, c: this.getTopPos() })
    yield new Line2D({ a: 0, b: -1, c: this.getBottomPos() })
    yield new Line2D({ a: -1, b: 0, c: this.getLeftPos() })
    yield new Line2D({ a: -1, b: 0, c: this.getRightPos() })
  }

  containsPoint(point: IPlainVec2D, tolerance?: float64): boolean {
    return isGeq(point.x, this.x, tolerance) &&
      isLeq(point.x, this.x + this.width, tolerance) &&
      isGeq(point.y, this.y, tolerance) &&
      isLeq(point.y, this.y + this.height, tolerance)
  }

  * #iterEdgeIntersections(origin: Vec2D, direction: IPlainVec2D, tolerance?: float64): Iterable<IIntersection> {
    for (const edge of this.iterEdges()) {
      const int = edge.intersectWithRay(origin, direction, tolerance)

      if (int && this.containsPoint(int.point, tolerance)) {
        yield int
      }
    }
  }

  intersectWithRay(origin: Vec2D, direction: IPlainVec2D, tolerance?: float64): IIntersection | undefined {
    return schwartzMin(
      ({ point }) => origin.distanceTo(point),
      this.#iterEdgeIntersections(origin, direction, tolerance),
    )
  }
}
