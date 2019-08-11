import { EPSILON } from '../constants.js'
import { sub } from './vector.js'

export function fromPointAndVector (point, vector) {
  return {
    a: vector.y,
    b: -vector.x,
    c: vector.x * point.y - vector.y * point.x
  }
}

export function fromPoints (p1, p2) {
  return fromPointAndVector(p1, sub(p2, p1))
}

export function intersectLines (l, m) {
  if (Math.abs(l.a) < EPSILON && Math.abs(m.a) < EPSILON) {
    return null
  } else if (Math.abs(l.a) < EPSILON) {
    return intersectLines(m, l)
  }

  const lambda = m.a / l.a

  if (Math.abs(m.b - lambda * l.b) < EPSILON) {
    return null
  }

  const y = (lambda * l.c - m.c) / (m.b - lambda * l.b)
  const x = -(l.b * y + l.c) / l.a

  return { x, y }
}

export function reflectPoint (line, normalLine, point) {
  const intersectionLine = {
    a: line.a,
    b: line.b,
    c: -line.a * point.x - line.b * point.y
  }

  const intersection = intersectLines(normalLine, intersectionLine)
  const direction = sub(intersection, point)

  return {
    x: point.x + 2 * direction.x,
    y: point.y + 2 * direction.y
  }
}
