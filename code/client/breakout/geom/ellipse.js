import { GAME_SIZE, EPSILON } from '../constants.js'
import { square } from '../support/arithmetic.js'

// Only use the upper half-plane portion of the ellipse

export function intersectLineWithEllipse (line, ellipse) {
  if (Math.abs(line.a) < EPSILON) {
    const a = square(line.a / ellipse.b) + square(1 / ellipse.a)
    const b = 2 * line.a * line.c / square(ellipse.b)
    const c = line.c / ellipse.b - 1

    const x = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a)
    const y = -(line.c + line.a * x) / line.b
    return { x, y: GAME_SIZE.y - y }
  } else {
    const a = square(line.b / ellipse.a) + square(1 / ellipse.b)
    const b = 2 * line.b * line.c / square(ellipse.a)
    const c = line.c / ellipse.a - 1

    const y = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a)
    const x = -(line.c + line.b * y) / line.a
    return { x, y: GAME_SIZE.y - y }
  }
}

export function tangentLineToEllipse (ellipse, point) {
  const deriv = 2 * ellipse.b / Math.sqrt(1 - square(point.x / ellipse.a))

  return {
    a: deriv,
    b: -1,
    c: point.y - deriv * point.x
  }
}
