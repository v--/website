import { Reflection } from '../support/reflection.js'

import { Figure } from './figure.js'
import { Line } from './line.js'
import { GameBall } from './game_ball.js'

export class Rectangle extends Figure {
  constructor (origin, size) {
    super()
    this.origin = origin
    this.size = size

    this.walls = [
      new Line(0, -1, this.origin.y),
      new Line(0, -1, this.origin.y + this.size.y),
      new Line(-1, 0, this.origin.x),
      new Line(-1, 0, this.origin.x + this.size.x)
    ]
  }

  containsPoint (point) {
    return point.x >= this.origin.x &&
      point.x <= this.origin.x + this.size.x &&
      point.y >= this.origin.y &&
      point.y <= this.origin.y + this.size.y
  }

  * generateReflections (ball) {
    for (const wall of this.walls) {
      for (const corner of ball.generateCorners()) {
        const motionLine = Line.fromPointAndVector(corner, ball.direction)
        const motionInt = wall.intersectWith(motionLine)

        if (motionInt === null || !motionInt.sub(corner).isUnidirectionalWith(ball.direction) || !this.containsPoint(motionInt)) {
          continue
        }

        const reflectedCenter = motionInt.sub(corner.sub(ball.center))
        const reflectedDirection = wall.reflectDirection(corner, ball.direction)

        yield new Reflection(
          new GameBall(reflectedCenter, reflectedDirection, ball.radius),
          this
        )
      }
    }
  }

  reflectBall (ball) {
    const reflections = Array.from(this.generateReflections(ball))
    return ball.findClosestReflection(reflections)
  }
}
