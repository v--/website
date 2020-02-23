import { Vector } from '../../../common/math/geom2d/vector.js'
import { Rectangle } from '../../../common/math/geom2d/rectangle.js'

import { MAX_BRICK_POWER } from '../constants.js'

const UNIT = new Vector({ x: 1, y: 1 })

export class GameBrick {
  constructor ({ origin, power }) {
    this.origin = origin
    this.power = power
    this.rectangle = new Rectangle({ origin, dims: UNIT })
  }

  getHit () {
    if (this.power > 1) {
      return new GameBrick({ origin: this.origin, power: this.power - 1 })
    }

    return null
  }

  getEvolved () {
    if (this.power < MAX_BRICK_POWER) {
      return new GameBrick({ origin: this.origin, power: this.power + 1 })
    }

    return null
  }
}
