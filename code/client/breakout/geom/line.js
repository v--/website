import { EPSILON } from '../constants.js'
import { add, sub, scaleToNormed } from './vector.js'

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

export function parallelThroughPoint (line, point) {
  return {
    a: line.a,
    b: line.b,
    c: -line.a * point.x - line.b * point.y
  }
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

export function reflectDirection (line, intersection, point, direction) {
  const moved = add(point, direction)
  const normalVector = { x: line.a, y: line.b }
  const normalLine = fromPointAndVector(intersection, normalVector)

  const pointNormalIntersection = intersectLines(normalLine, parallelThroughPoint(line, point))
  const movedNormalIntersection = intersectLines(normalLine, parallelThroughPoint(line, moved))

  const reflectedPoint = {
    x: point.x + 2 * (pointNormalIntersection.x - point.x),
    y: point.y + 2 * (pointNormalIntersection.y - point.y)
  }

  const reflectedMoved = {
    x: moved.x + 2 * (movedNormalIntersection.x - moved.x),
    y: moved.y + 2 * (movedNormalIntersection.y - moved.y)
  }

  return scaleToNormed(sub(reflectedPoint, reflectedMoved))
}
