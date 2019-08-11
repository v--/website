import Entity from './entity.js'
import Collision from './collision.js'
import { GAME_SIZE, PADDLE_SIZE, REFLECTION_PADDING, BALL_RADIUS, EPSILON } from '../constants.js'
import { sub, scale, dist } from '../geom/vector.js'
import { fromPointAndVector, reflectDirection } from '../geom/line.js'
import { intersectNonHorizontalLineWithEllipse, tangentToLowerSemiellipse, leftFocus, rightFocus } from '../geom/ellipse.js'

function constructPaddleEllipse (paddleX) {
  return {
    a: PADDLE_SIZE.x,
    b: PADDLE_SIZE.y,
    x: paddleX,
    y: GAME_SIZE.y
  }
}

export default class PaddleEntity extends Entity {
  constructor (paddleX) {
    super()
    this.paddleX = paddleX
  }

  collides (ball) {
    const paddleEllipse = constructPaddleEllipse(this.paddleX)
    const f1 = leftFocus(paddleEllipse)
    const f2 = rightFocus(paddleEllipse)
    return dist(ball.center, f1) + dist(ball.center, f2) < 2 * paddleEllipse.a
  }

  predictCollision (ball) {
    const motionLine = fromPointAndVector(ball.center, ball.direction)
    const paddleEllipse = constructPaddleEllipse(this.paddleX)

    const intersection = Math.abs(motionLine.a) < EPSILON ? null : intersectNonHorizontalLineWithEllipse(motionLine, paddleEllipse)
    const tangent = intersection && tangentToLowerSemiellipse(paddleEllipse, intersection)

    if (tangent !== null) {
      const reflectedDirection = reflectDirection(tangent, intersection, ball.center, ball.direction)
      return new PaddleCollision(ball, intersection, reflectedDirection)
    }

    return null
  }
}

export class PaddleCollision extends Collision {
  constructor (ball, intersection, reflectedDirection) {
    super()
    this.ball = ball
    this.intersection = intersection
    this.reflectedDirection = reflectedDirection
  }

  get distance () {
    return dist(this.ball.center, this.intersection)
  }

  getStateUpdates () {
    return {
      ball: {
        center: sub(this.intersection, scale(this.ball.direction, BALL_RADIUS + REFLECTION_PADDING)),
        direction: this.reflectedDirection
      }
    }
  }
}
