import { Line2D } from './line2d.ts'
import { type IIntersectible, type IIntersection } from './types.ts'
import { Vec2D } from './vec2d.ts'
import { isClose, isLess } from '../../support/floating.ts'
import { type float64 } from '../../types/numbers.ts'

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

  pointAtAngle(phi: float64) {
    return new Vec2D({
      x: this.x0 + this.a * Math.cos(phi),
      y: this.y0 + this.b * Math.sin(phi),
    })
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

    if (isLess(d, 0, tolerance)) {
      return undefined
    }

    const t1 = (-b - Math.sqrt(d)) / (2 * a)
    const t2 = (-b + Math.sqrt(d)) / (2 * a)

    if (isLess(t1, 0, tolerance) && isLess(t2, 0, tolerance)) {
      return
    }

    const t = isLess(t1, 0, tolerance) ? t2 : (isLess(t2, 0, tolerance) ? t1 : Math.min(t1, t2))
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
  tangentAtPoint(point: Vec2D, tolerance?: float64) {
    const left = point.y - this.y0
    const right = Math.sqrt(1 - ((point.x - this.x0) / this.a) ** 2) * this.b
    const e = isClose(left, right, tolerance) ? 1 : -1
    const deriv = e * this.b * (point.x - this.x0) / ((point.x - this.x0) ** 2 - this.a ** 2)

    return new Line2D({
      a: deriv,
      b: -1,
      c: point.y - point.x * deriv,
    })
  }

  intersectWithRay(origin: Vec2D, direction: Vec2D, tolerance?: float64): IIntersection | undefined {
    const intPoint = this.calculateIntersectionPointWithRay(origin, direction, tolerance)

    if (intPoint === undefined) {
      return undefined
    }

    const tangent = this.tangentAtPoint(intPoint, tolerance)
    return tangent.intersectWithRay(origin, direction, tolerance)
  }
}
