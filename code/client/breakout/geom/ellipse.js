import { EPSILON } from '../constants.js'
import { square } from '../support/arithmetic.js'

export function intersectNonHorizontalLineWithEllipse (line, ellipse) {
  const a = square(line.b / (line.a * ellipse.a)) + 1 / square(ellipse.b)
  const b = 2 * line.b * (line.c + line.a * ellipse.x) / square(line.a * ellipse.a) - 2 * ellipse.y / square(ellipse.b)
  const c = (square(line.c) + square(line.a * ellipse.x) + 2 * line.a * line.c * ellipse.x) / square(line.a * ellipse.a) + square(ellipse.y / ellipse.b) - 1

  const d = b * b - 4 * a * c

  if (d < 0) {
    return null
  }

  const y = (-b - Math.sqrt(d)) / (2 * a)
  const x = -(line.c + line.b * y) / line.a
  return { x, y }
}

function lowerHalfDeriv (ellipse, x) {
  return ellipse.b / square(ellipse.a) * (x - ellipse.x) / Math.sqrt(1 - square((x - ellipse.x) / ellipse.a))
}

export function tangentToLowerSemiellipse (ellipse, point) {
  if (Math.abs(Math.abs(point.x - ellipse.x) - ellipse.a) < EPSILON) {
    return null
  }

  const deriv = lowerHalfDeriv(ellipse, point.x)

  return {
    a: deriv,
    b: -1,
    c: point.y - point.x * deriv
  }
}
