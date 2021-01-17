import { isSameNumber } from '../numeric/floating.js'

import { Vector } from './vector.js'

// Standard line equation, ax + by + c = 0
export interface LineParams {
  a: number
  b: number
  c: number
}

export interface Line extends LineParams {}
export class Line {
  static fromTwoPoints(pointA: Vector, pointB: Vector): Line {
    return this.fromPointAndVector(pointA, pointB.sub(pointA))
  }

  static fromPointAndVector(point: Vector, vector: Vector): Line {
    const norm = vector.getNorm()
    return new this({
      a: vector.y / norm,
      b: -vector.x / norm,
      c: (vector.x * point.y - vector.y * point.x) / norm
    })
  }

  constructor(params: LineParams) {
    Object.assign(this, params)
  }

  isParallelWith(other: Line) {
    return isSameNumber(this.a * other.b, this.b * other.a)
  }

  coincidesWith(other: Line) {
    return this.isParallelWith(other) && isSameNumber(this.b * other.c, this.c * other.b)
  }

  intersectWith(other: Line): TypeCons.Optional<Vector> {
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

  getParallelThrough(point: Vector) {
    return new Line({
      a: this.a,
      b: this.b,
      c: -this.a * point.x - this.b * point.y
    })
  }

  getNormalLineThrough(point: Vector) {
    return Line.fromPointAndVector(
      point,
      new Vector({ x: this.a, y: this.b })
    )
  }

  reflectDirection(point: Vector, direction: Vector) {
    const normalLine = this.getNormalLineThrough(point)
    const moved = point.add(direction)

    const pointNormalIntersection = normalLine.intersectWith(this.getParallelThrough(point))!
    const movedNormalIntersection = normalLine.intersectWith(this.getParallelThrough(moved))!

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

  orientedDistanceToPoint(vector: Vector) {
    return this.a * vector.x + this.b * vector.y + this.c
  }
}
