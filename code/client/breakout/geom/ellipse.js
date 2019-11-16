import { isSameNumber } from '../../../common/support/numeric.js'

import { Reflection } from './reflection.js'
import { Figure } from './figure.js'
import { Vector } from './vector.js'
import { Line } from './line.js'
import { GameBall } from './game_ball.js'

export class Ellipse extends Figure {
  constructor (center, axes) {
    super()
    this.center = center
    this.axes = axes
  }

  intersectWithLine (line) {
    const { center, axes } = this

    if (isSameNumber(line.a, 0)) {
      return new Vector(center.x - axes.x, center.y)
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
    return new Vector(x, y)
  }

  // Only the lower semiellipse is supported
  tangentAt (point) {
    const { center, axes } = this

    if (isSameNumber(Math.abs(point.x - center.x), axes.x)) {
      return null
    }

    const deriv = axes.y / (axes.x ** 2) * (point.x - center.x) / Math.sqrt(1 - ((point.x - center.x) / axes.x) ** 2)
    return new Line(deriv, -1, point.y - point.x * deriv)
  }

  * generateReflections (ball) {
    for (const corner of ball.generateCorners()) {
      const motionLine = Line.fromPointAndVector(corner, ball.direction)
      const motionInt = this.intersectWithLine(motionLine)

      if (motionInt === null || !motionInt.sub(corner).isUnidirectionalWith(ball.direction)) {
        continue
      }

      const tangent = this.tangentAt(motionInt)

      if (tangent === null) {
        continue
      }

      const reflectedCenter = motionInt.sub(corner.sub(ball.center))
      const reflectedDirection = tangent.reflectDirection(corner, ball.direction)

      yield new Reflection(
        new GameBall(reflectedCenter, reflectedDirection, ball.radius),
        this
      )
    }
  }

  reflectBall (ball) {
    const reflections = Array.from(this.generateReflections(ball))
    return ball.findClosestReflection(reflections)
  }
}
