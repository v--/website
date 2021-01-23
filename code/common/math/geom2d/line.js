import { isSameNumber } from '../numeric/floating.js'

import { Vector } from './vector.js'

/**
 * Standard line equation, ax + by + c = 0
 * @implements TGeom2D.ILine
 */
export class Line {
  /**
   * @param {Vector} pointA
   * @param {Vector} pointB
   * @returns Line
   */
  static fromTwoPoints(pointA, pointB) {
    return this.fromPointAndVector(pointA, pointB.sub(pointA))
  }

  /**
   * @param {Vector} point
   * @param {Vector} vector
   * @returns Line
   */
  static fromPointAndVector(point, vector) {
    const norm = vector.getNorm()
    return new this({
      a: vector.y / norm,
      b: -vector.x / norm,
      c: (vector.x * point.y - vector.y * point.x) / norm
    })
  }

  /**
   * @param {TGeom2D.ILineParams} params
   */
  constructor({ a, b, c }) {
    this.a = a
    this.b = b
    this.c = c
  }

  /**
   * @param {Line} other
   */
  isParallelWith(other) {
    return isSameNumber(this.a * other.b, this.b * other.a)
  }

  /**
   * @param {Line} other
   */
  coincidesWith(other) {
    return this.isParallelWith(other) && isSameNumber(this.b * other.c, this.c * other.b)
  }

  /**
   * @param {Line} other
   * @returns {Vector | undefined}
   */
  intersectWith(other) {
    if (isSameNumber(this.a, 0) && isSameNumber(other.a, 0)) {
      return 
    } else if (isSameNumber(this.a, 0)) {
      return other.intersectWith(this)
    }

    const lambda = other.a / this.a

    if (isSameNumber(other.b, lambda * this.b)) {
      return 
    }

    const y = (lambda * this.c - other.c) / (other.b - lambda * this.b)
    const x = -(this.b * y + this.c) / this.a

    return new Vector({ x, y })
  }

  /**
   * @param {Vector} point
   */
  getParallelThrough(point) {
    return new Line({
      a: this.a,
      b: this.b,
      c: -this.a * point.x - this.b * point.y
    })
  }

  /**
   * @param {Vector} point
   * @returns {Line}
   */
  getNormalLineThrough(point) {
    return Line.fromPointAndVector(
      point,
      new Vector({ x: this.a, y: this.b })
    )
  }

  /**
   * @param {Vector} point
   * @param {Vector} direction
   * @returns {Vector}
   */
  reflectDirection(point, direction) {
    const normalLine = this.getNormalLineThrough(point)
    const moved = point.add(direction)

    const pointNormalIntersection = /** @type {Vector} */ (normalLine.intersectWith(this.getParallelThrough(point)))
    const movedNormalIntersection = /** @type {Vector} */ (normalLine.intersectWith(this.getParallelThrough(moved)))

    const reflectedPoint = new Vector({
      x: point.x + 2 * (pointNormalIntersection.x - point.x),
      y: point.y + 2 * (pointNormalIntersection.y - point.y)
    })

    const reflectedMoved = new Vector({
      x: moved.x + 2 * (movedNormalIntersection.x - moved.x),
      y: moved.y + 2 * (movedNormalIntersection.y - moved.y)
    })

    return reflectedPoint.sub(reflectedMoved).scaleToNormed()
  }

  /**
   * @param {Vector} point
   * @returns {TNum.Float64}
   */
  orientedDistanceToPoint(point) {
    return this.a * point.x + this.b * point.y + this.c
  }
}
