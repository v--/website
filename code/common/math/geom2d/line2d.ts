import { ReflectionError } from './errors.ts'
import { type IIntersectible, type IIntersection } from './types.ts'
import { Vec2D } from './vec2d.ts'
import { isClose, isLeq, isZero } from '../../support/floating.ts'
import { type float64 } from '../../types/numbers.ts'

export interface ILine2DConfig {
  a: float64
  b: float64
  c: float64
}

/**
 * General line equation, Ax + By + C = 0.
 * We use lowercase letters for the coefficients only because of programming conventions.
 */
export class Line2D implements ILine2DConfig, IIntersectible {
  a: float64
  b: float64
  c: float64

  static fromTwoPoints(pointA: Vec2D, pointB: Vec2D): Line2D {
    return this.fromPointAndVector(pointA, pointB.sub(pointA))
  }

  static fromPointAndVector(point: Vec2D, vector: Vec2D): Line2D {
    const norm = vector.getNorm()
    return new this({
      a: vector.y / norm,
      b: -vector.x / norm,
      c: (vector.x * point.y - vector.y * point.x) / norm,
    })
  }

  constructor({ a, b, c }: ILine2DConfig) {
    this.a = a
    this.b = b
    this.c = c
  }

  isParallelWith(other: Line2D) {
    return isClose(this.a * other.b, this.b * other.a)
  }

  coincidesWith(other: Line2D) {
    return this.isParallelWith(other) && isClose(this.b * other.c, this.c * other.b)
  }

  getParallelThrough(point: Vec2D): Line2D {
    return new Line2D({
      a: this.a,
      b: this.b,
      c: -this.a * point.x - this.b * point.y,
    })
  }

  getNormalLineThrough(point: Vec2D): Line2D {
    return Line2D.fromPointAndVector(
      point,
      new Vec2D({ x: this.a, y: this.b }),
    )
  }

  getDirection(): Vec2D {
    return new Vec2D({ x: this.b, y: -this.a }).scaleToNormed()
  }

  /**
   * Intersect the line
   *   l: Ax + By + C = 0
   * with another line though the origin O(x₁, y₁) with direction d(x₂, y₂) by finding a scalar t such that
   *   A(x₁ + t x₂) + B(y₁ + t y₂) + C = 0.
   *
   * This amounts to solving the linear equation
   *   (A x₂ + B y₂) t = -A x₁ - B y₁ - C
   */
  #getIntersectionParameter(origin: Vec2D, direction: Vec2D): float64 | undefined {
    const divisor = this.a * direction.x + this.b * direction.y

    if (isZero(divisor)) {
      return undefined
    }

    return (-this.a * origin.x - this.b * origin.y - this.c) / divisor
  }

  /**
   * Reflect the ray with origin P and direction d through the line l.
   *
   * Consider the following figure:
   *
   *     R      P
   *     |\    /|
   *     | \  / |
   * ____|__\/__|___ l
   *     P"  Q  P'
   *
   * We find the points Q, P', P" and finally R. Our desired reflected direction vector is then QR.
   */
  reflectRayDirection(origin: Vec2D, direction: Vec2D, tolerance?: float64): Vec2D | undefined {
    // This intersection point is Q in the figure
    const tIntersection = this.#getIntersectionParameter(origin, direction)

    if (tIntersection === undefined || isLeq(tIntersection, 0, tolerance)) {
      return undefined
    }

    const intersection = origin.translate(direction, tIntersection)
    const normalDirection = new Vec2D({ x: this.a, y: this.b })

    // This projection point is P' in the figure
    const tProjection = this.#getIntersectionParameter(origin, normalDirection)

    if (tProjection === undefined) {
      return undefined
    }

    const projection = origin.translate(normalDirection, tProjection)

    // This reflected projection point is P" in the figure; that is, P' reflected through Q
    const reflectedProjection = intersection.scaleBy(2).sub(projection)
    const parallelLine = this.getParallelThrough(origin)

    // This reflected point is R in the figure
    const tReflected = parallelLine.#getIntersectionParameter(reflectedProjection, normalDirection)

    if (tReflected === undefined) {
      return undefined
    }

    const reflected = reflectedProjection.translate(normalDirection, tReflected)

    if (reflected.equals(intersection)) {
      return undefined
    }

    return reflected.sub(intersection).scaleToNormed()
  }

  intersectWithRay(origin: Vec2D, direction: Vec2D, tolerance?: float64): IIntersection | undefined {
    const t = this.#getIntersectionParameter(origin, direction)

    if (t === undefined || isLeq(t, 0, tolerance)) {
      return undefined
    }

    return {
      point: origin.translate(direction, t),
      calculateReflection: () => {
        const refl = this.reflectRayDirection(origin, direction, tolerance)

        if (refl === undefined) {
          throw new ReflectionError('Could not calculate reflection')
        }

        return refl
      },
    }
  }
}
