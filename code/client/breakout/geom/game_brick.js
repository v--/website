import { Vector } from '../../../common/math/geom2d/vector.js'
import { Rectangle } from '../../../common/math/geom2d/rectangle.js'

import { MAX_BRICK_POWER } from '../constants.js'

const UNIT = new Vector(1, 1)

export class GameBrick {
  constructor (origin, power) {
    this.origin = origin
    this.power = power
    this.rectangle = new Rectangle(origin, UNIT)
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
