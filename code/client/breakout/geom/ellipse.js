import { EPSILON } from '../constants.js'

export function eccentricity (ellipse) {
  return ellipse.a ** 2 - ellipse.b ** 2
}

export function leftFocus (ellipse) {
  return {
    x: ellipse.x - eccentricity(ellipse) / ellipse.a,
    y: ellipse.y
  }
}

export function rightFocus (ellipse) {
  return {
    x: ellipse.x + eccentricity(ellipse) / ellipse.a,
    y: ellipse.y
  }
}

export function intersectNonHorizontalLineWithEllipse (line, ellipse) {
  const a = (line.b / (line.a * ellipse.a)) ** 2 + 1 / (ellipse.b ** 2)
  const b = 2 * line.b * (line.c + line.a * ellipse.x) / ((line.a * ellipse.a) ** 2) - 2 * ellipse.y / (ellipse.b ** 2)
  const c = (line.c ** 2 + (line.a * ellipse.x) ** 2 + 2 * line.a * line.c * ellipse.x) / ((line.a * ellipse.a) ** 2) + (ellipse.y / ellipse.b) ** 2 - 1

  const d = b * b - 4 * a * c

  if (d < 0) {
    return null
  }

  const y = (-b - Math.sqrt(d)) / (2 * a)
  const x = -(line.c + line.b * y) / line.a
  return { x, y }
}

function lowerHalfDeriv (ellipse, x) {
  return ellipse.b / (ellipse.a ** 2) * (x - ellipse.x) / Math.sqrt(1 - ((x - ellipse.x) / ellipse.a) ** 2)
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
