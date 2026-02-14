import { Vec2D } from './vec2d.ts'
import { type float64 } from '../../types/numbers.ts'
import { type NewtonRaphsonIterationConfig, newtonRaphsonMin } from '../numeric.ts'
import { Line2D } from './line2d.ts'
import { type IIntersectible, type IIntersection } from './types.ts'
import { isClose, isLeq } from '../../support/floating.ts'

export interface IAAEllipseConfig {
  x0: float64
  y0: float64
  a: float64
  b: float64
}

/**
 * An axis-aligned ellipse with standard equation ((x - x₀) / a)² + ((y - y₀) / b)² = 1
 */
export class AAEllipse implements IAAEllipseConfig, IIntersectible {
  x0: float64
  y0: float64
  a: float64
  b: float64

  constructor({ x0, y0, a, b }: IAAEllipseConfig) {
    this.x0 = x0
    this.y0 = y0
    this.a = a
    this.b = b
  }

  getCenter() {
    return new Vec2D({
      x: this.x0,
      y: this.y0,
    })
  }

  pointAtAngle(phi: float64) {
    return new Vec2D({
      x: this.x0 + this.a * Math.cos(phi),
      y: this.y0 + this.b * Math.sin(phi),
    })
  }

  /**
   * The first and second derivatives of d(φ)²/2, where d(φ) is the Euclidean distance from some point P(x₁, y₁) to the point at angle φ:
   *   d(φ) = sqrt((x₀ + a cos(ϕ) - x₁)² + (y₀ + b sin(ϕ) - y₁)²)
   */
  #distDerivatives(point: Vec2D, phi: float64): NewtonRaphsonIterationConfig {
    const sin = Math.sin(phi)
    const cos = Math.cos(phi)

    const firstDiffXTerm = -(this.x0 + this.a * cos - point.x) * this.a * sin
    const firstDiffYTerm = (this.y0 + this.b * sin - point.y) * this.b * cos

    // Herbie (https://herbie.uwplse.org/demo/) claims that (b - a) (b + a) is much more efficient than b² − a²
    const secondDiffMixedTerm = (this.b - this.a) * (this.b + this.a) * Math.cos(2 * phi)
    const secondDiffXTerm = -(this.x0 - point.x) * this.a * Math.cos(phi)
    const secondDiffYTerm = -(this.y0 - point.y) * this.b * Math.sin(phi)

    return {
      functionValue: firstDiffXTerm + firstDiffYTerm,
      derivativeValue: secondDiffMixedTerm + secondDiffXTerm + secondDiffYTerm,
    }
  }

  /**
   * Numerically find the nearest point on the semiellipse.
   */
  nearestPoint(point: Vec2D) {
    const phi = newtonRaphsonMin(
      this.#distDerivatives.bind(this, point),
      point.sub(this.getCenter()).getAngle(),
    )

    return this.pointAtAngle(phi)
  }

  /**
   * Intersect the ellipse
   *   ((x - x₀) / a)² + ((y - y₀) / b)² = 1
   * with the ray with origin O(x₁, y₁) and direction d(x₂, y₂) by finding a nonnegative scalar t such that
   *   ((x₁ + t x₂ - x₀) / a)² + ((y₁ + t y₂ - y₀) / b)² = 1
   *
   * This amounts to solving the quadratic equation
   *   ((x₂ / a)² + …) t² + (2 x₂ (x₁ - x₀) / a² + …) t + (((x₁ - x₀) / a)² + … - 1) = 0
   */
  calculateIntersectionPointWithRay(origin: Vec2D, direction: Vec2D, tolerance?: float64): Vec2D | undefined {
    // The variables a, b and c here are the coefficients of the quadratic equation
    const a = (direction.x / this.a) ** 2 + (direction.y / this.b) ** 2
    const b = (2 * direction.x * (origin.x - this.x0)) / this.a ** 2 + (2 * direction.y * (origin.y - this.y0)) / this.b ** 2
    const c = ((origin.x - this.x0) / this.a) ** 2 + ((origin.y - this.y0) / this.b) ** 2 - 1

    const d = b ** 2 - 4 * a * c

    if (d < 0) {
      return
    }

    const t1 = (-b - Math.sqrt(d)) / (2 * a)
    const t2 = (-b + Math.sqrt(d)) / (2 * a)

    if (isLeq(t1, 0, tolerance) && isLeq(t2, 0, tolerance)) {
      return
    }

    const t = isLeq(t1, 0, tolerance) ? t2 : (isLeq(t2, 0, tolerance) ? t1 : Math.min(t1, t2))
    return origin.translate(direction, t)
  }

  /**
   * Given a point P(x₁, y₁) on the ellipse, we find its tangent line.
   *
   * With y and x as free variables, we have
   *   (y - y₀)² = (1 - ((x - x₀) / a)²) b²,
   * which allows us to express y as a function of x in two ways.
   *
   * Let ε be either -1 or 1 so that
   *   y₁ = ε sqrt(1 - ((x₁ - x₀) / a)²) b + y₀.
   *
   * Then, regarding y as a function of x, we have
   *   y(x) = ε sqrt(1 - ((x - x₀) / a)²) b + y₀
   * which we can derive to obtain
   *   y'(x) = ε (1 / 2) (1 - ((x - x₀) / a)²)⁻¹ (-2(x - x₀) / a²) b
   * and simplify as
   *   y'(x) = ε b (x - x₀) / ((x - x₀)² - a²)
   *
   * Finally, we simply extract a general line equation from the interpolation
   *   x ↦ y(x₁) + y'(x₁) (x - x₁)
   */
  tangentAtPoint(point: Vec2D) {
    const left = point.y - this.y0
    const right = Math.sqrt(1 - ((point.x - this.x0) / this.a) ** 2) * this.b
    const e = isClose(left, right) ? 1 : -1
    const deriv = e * this.b * (point.x - this.x0) / ((point.x - this.x0) ** 2 - this.a ** 2)

    return new Line2D({
      a: deriv,
      b: -1,
      c: point.y - point.x * deriv,
    })
  }

  containsPoint(point: Vec2D) {
    return ((this.x0 - point.x) / this.a) ** 2 + ((this.y0 - point.y) / this.b) ** 2 <= 1
  }

  intersectWithRay(origin: Vec2D, direction: Vec2D): IIntersection | undefined {
    const nearest = this.calculateIntersectionPointWithRay(origin, direction)

    if (nearest === undefined) {
      return undefined
    }

    const tangent = this.tangentAtPoint(nearest)
    return tangent.intersectWithRay(origin, direction)
  }
}
