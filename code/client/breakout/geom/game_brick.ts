import { Vector } from '../../../common/math/geom2d/vector.js'
import { Rectangle } from '../../../common/math/geom2d/rectangle.js'

const UNIT = new Vector({ x: 1, y: 1 })

type GameBrickPower = 1 | 2 | 3

export interface GameBrickParams {
  origin: Vector
  power: GameBrickPower
}

export interface GameBrick extends GameBrickParams {
  rectangle: Rectangle
}

export class GameBrick {
  rectangle: Rectangle

  constructor(params: GameBrickParams) {
    Object.assign(this, params)
    this.rectangle = new Rectangle({
      origin: this.origin,
      dims: UNIT
    })
  }

  getHit() {
    if (this.power > 1) {
      return new GameBrick({ origin: this.origin, power: this.power - 1 as GameBrickPower })
    }
  }

  getEvolved() {
    if (this.power < 3) {
      return new GameBrick({ origin: this.origin, power: this.power + 1 as GameBrickPower })
    }
  }
}
