import { BRICK_MAX_POWER } from './constants.ts'
import { BreakoutBrickError } from './errors.ts'
import { type GameBrickPower } from './types.ts'
import { AARect, type IIntersectible, type IIntersection, Vec2D } from '../../common/math/geom2d.ts'
import { type uint32 } from '../../common/types/numbers.ts'

export interface IBreakoutBrickConfig {
  x: uint32
  y: uint32
  power: GameBrickPower
}

export class BreakoutBrick implements IBreakoutBrickConfig, IIntersectible {
  readonly x: uint32
  readonly y: uint32
  readonly power: GameBrickPower
  #rect: AARect

  constructor({ x, y, power }: IBreakoutBrickConfig) {
    this.x = x
    this.y = y
    this.power = power
    this.#rect = new AARect({ x, y, width: 1, height: 1 })
  }

  intersectWithRay(origin: Vec2D, direction: Vec2D): IIntersection | undefined {
    const int = this.#rect.intersectWithRay(origin, direction)

    if (int === undefined) {
      return undefined
    }

    return {
      point: int.point,
      tangent: int.tangent,
      figure: this,
    }
  }

  evolve() {
    if (this.power >= BRICK_MAX_POWER) {
      throw new BreakoutBrickError(`Cannot evolve brick at ${this.x}×${this.y} with power ${this.power}`)
    }

    return new BreakoutBrick({
      x: this.x,
      y: this.y,
      power: this.power + 1 as GameBrickPower,
    })
  }

  devolve() {
    if (this.power <= 0) {
      throw new BreakoutBrickError(`Cannot devolve brick at ${this.x}×${this.y} with power ${this.power}`)
    }

    return new BreakoutBrick({
      x: this.x,
      y: this.y,
      power: this.power - 1 as GameBrickPower,
    })
  }
}
