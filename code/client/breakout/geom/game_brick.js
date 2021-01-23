import { Vector } from '../../../common/math/geom2d/vector.js'
import { Rectangle } from '../../../common/math/geom2d/rectangle.js'

const UNIT = new Vector({ x: 1, y: 1 })

/**
 * @implements {TBreakout.IGameBrick}
 */
export class GameBrick {
  /**
   * @param {TBreakout.IGameBrickParams} params
   */
  constructor({ origin, power }) {
    this.origin = origin
    this.power = power
    this.rectangle = new Rectangle({
      origin: this.origin,
      dims: UNIT
    })
  }

  getHit() {
    if (this.power > 1) {
      return new GameBrick({
        origin: this.origin,
        power: /** @type {TBreakout.GameBrickPower} */ (this.power - 1)
      })
    }
  }

  getEvolved() {
    if (this.power < 3) {
      return new GameBrick({
        origin: this.origin,
        power: /** @type {TBreakout.GameBrickPower} */ (this.power + 1)
      })
    }
  }
}
