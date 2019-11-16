import { Vector } from './vector.js'
import { Figure } from './figure.js'

const EPSILON = 1e-3

export class Line extends Figure {
  static fromTwoPoints (pointA, pointB) {
    return this.fromPointAndVector(pointA, pointB.sub(pointA))
  }

  static fromPointAndVector (point, vector) {
    const norm = vector.getNorm()
    return new this(
      vector.y / norm,
      -vector.x / norm,
      (vector.x * point.y - vector.y * point.x) / norm
    )
  }

  constructor (a, b, c) {
    super()
    this.a = a
    this.b = b
    this.c = c
  }

  isParallelWith (other) {
    return Math.abs(this.a * other.b - this.b * other.a) < EPSILON
  }

  coincidesWith (other) {
    return this.isParallelWith(other) && Math.abs(this.b * other.c - this.c * other.b) < EPSILON
  }

  intersectWith (other) {
    if (Math.abs(this.a) < EPSILON && Math.abs(other.a) < EPSILON) {
      return null
    } else if (Math.abs(this.a) < EPSILON) {
      return other.intersectWith(this)
    }

    const lambda = other.a / this.a

    if (Math.abs(other.b - lambda * this.b) < EPSILON) {
      return null
    }

    const y = (lambda * this.c - other.c) / (other.b - lambda * this.b)
    const x = -(this.b * y + this.c) / this.a

    return new Vector(x, y)
  }

  getParallelThrough (point) {
    return new this.constructor(
      this.a,
      this.b,
      -this.a * point.x - this.b * point.y
    )
  }

  getNormalLineThrough (point) {
    return this.constructor.fromPointAndVector(
      point,
      new Vector(this.a, this.b)
    )
  }

  reflectDirection (point, direction) {
    const normalLine = this.getNormalLineThrough(point)
    const moved = point.add(direction)

    const pointNormalIntersection = normalLine.intersectWith(this.getParallelThrough(point))
    const movedNormalIntersection = normalLine.intersectWith(this.getParallelThrough(moved))

    const reflectedPoint = new Vector(
      point.x + 2 * (pointNormalIntersection.x - point.x),
      point.y + 2 * (pointNormalIntersection.y - point.y)
    )

    const reflectedMoved = new Vector(
      moved.x + 2 * (movedNormalIntersection.x - moved.x),
      moved.y + 2 * (movedNormalIntersection.y - moved.y)
    )

    return reflectedPoint.sub(reflectedMoved).scaleToNormed()
  }
}
