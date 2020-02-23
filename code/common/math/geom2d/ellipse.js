import { isSameNumber } from '../../../common/math/numeric/floating.js'

import { Vector } from './vector.js'
import { Line } from './line.js'

export class Ellipse {
  constructor ({ center, axes }) {
    this.center = center
    this.axes = axes
  }

  intersectWithLine (line) {
    const { center, axes } = this

    if (isSameNumber(line.a, 0)) {
      return new Vector({ x: center.x - axes.x, y: center.y })
    }

    const a = (line.b / (line.a * axes.x)) ** 2 + 1 / (axes.y ** 2)
    const b = 2 * line.b * (line.c + line.a * center.x) / ((line.a * axes.x) ** 2) - 2 * center.y / (axes.y ** 2)
    const c = (line.c ** 2 + (line.a * center.x) ** 2 + 2 * line.a * line.c * center.x) / ((line.a * axes.x) ** 2) + (center.y / axes.y) ** 2 - 1

    const d = b * b - 4 * a * c

    if (d < 0) {
      return null
    }

    const y = (-b - Math.sqrt(d)) / (2 * a)
    const x = -(line.c + line.b * y) / line.a
    return new Vector({ x, y })
  }

  tangentAtLowerSemiellipse (point) {
    const { center, axes } = this

    if (isSameNumber(Math.abs(point.x - center.x), axes.x)) {
      return null
    }

    const deriv = axes.y / (axes.x ** 2) * (point.x - center.x) / Math.sqrt(1 - ((point.x - center.x) / axes.x) ** 2)
    return new Line({ a: deriv, b: -1, c: point.y - point.x * deriv })
  }
}
