import { EPSILON } from '../constants.js'
import { add, sub, scale } from './vector.js'

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

export function reflectPoint (line, point) {
  const normalLine = fromPointAndVector(point, { x: line.a, y: line.b })

  const intersectionLine = {
    a: line.a,
    b: line.b,
    c: -line.a * point.x - line.b * point.y
  }

  return add(point, scale(sub(intersectLines(normalLine, intersectionLine), point), 2))
}
