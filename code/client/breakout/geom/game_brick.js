import { MAX_BRICK_POWER } from '../constants.js'
import { Reflection } from '../support/reflection.js'

import { Figure } from './figure.js'
import { Vector } from './vector.js'
import { Rectangle } from './rectangle.js'

const UNIT = new Vector(1, 1)

export class GameBrick extends Figure {
  constructor (origin, power) {
    super()
    this.origin = origin
    this.power = power
    this.rectangle = new Rectangle(origin, UNIT)
  }

  reflectBall (ball) {
    const reflection = this.rectangle.reflectBall(ball)

    if (reflection === null) {
      return null
    }

    return new Reflection(reflection.ball, this)
  }

  hit () {
    if (this.power > 1) {
      return new GameBrick(this.origin, this.power - 1)
    }

    return null
  }

  evolve () {
    if (this.power < MAX_BRICK_POWER) {
      return new GameBrick(this.origin, this.power + 1)
    }

    return null
  }
}
