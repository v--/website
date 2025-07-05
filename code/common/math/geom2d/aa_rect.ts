import { Line2D } from './line2d.ts'
import { type IIntersectible, type IIntersection } from './types.ts'
import { type IPlainVec2D, Vec2D } from './vec2d.ts'
import { clamp, isGeq, isLeq } from '../../support/floating.ts'
import { EmptyIterError, schwartzMin } from '../../support/iteration.ts'
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

  getArea() {
    return this.width * this.height
  }

  getBoundingBox() {
    return this
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

  * #iterEdgeIntersections(origin: Vec2D, direction: Vec2D): Iterable<IIntersection> {
    for (const edge of this.iterEdges()) {
      const int = edge.intersectWithRay(origin, direction)

      if (int && this.containsPoint(int.point)) {
        yield int
      }
    }
  }

  intersectWithRay(origin: Vec2D, direction: Vec2D): IIntersection | undefined {
    try {
      return schwartzMin(
        ({ point }) => origin.distanceTo(point),
        this.#iterEdgeIntersections(origin, direction),
      )
    } catch (err) {
      if (err instanceof EmptyIterError) {
        return undefined
      }

      throw err
    }
  }

  clampToRect(point: Vec2D) {
    return new Vec2D({
      x: clamp(point.x, this.getLeftPos(), this.getRightPos()),
      y: clamp(point.y, this.getTopPos(), this.getBottomPos()),
    })
  }
}

export function grandBoundingBox(figures: Iterable<AARect>) {
  let xMin = 0
  let xMax = 0
  let yMin = 0
  let yMax = 0

  for (const figure of figures) {
    const box = figure.getBoundingBox()
    xMin = Math.min(xMin, box.getLeftPos())
    xMax = Math.max(xMax, box.getRightPos())
    yMin = Math.min(yMin, box.getTopPos())
    yMax = Math.max(yMax, box.getBottomPos())
  }

  return new AARect({
    width: xMax - xMin,
    height: yMax - yMin,
    x: xMin,
    y: yMin,
  })
}
