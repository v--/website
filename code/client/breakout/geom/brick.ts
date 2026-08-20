import { AARect, type IPlainVec2D, Vec2D } from '../../../common/math/geom2d.ts'
import { type uint32 } from '../../../common/types/numbers.ts'
import { BALL_RADIUS, BRICK_MAX_POWER } from '../constants.ts'
import { BreakoutBrickError } from '../errors.ts'
import { computeBallIntersectionWithFigure } from './ball.ts'
import { type GameBrickPower, type IBreakoutIntersection, type IBrickState } from '../types.ts'

export interface IBreakoutBrickConfig extends IBrickState {
  index: uint32
}

export class BreakoutBrick implements IBreakoutBrickConfig {
  readonly x: uint32
  readonly y: uint32
  readonly index: uint32
  readonly power: GameBrickPower
  readonly bounds: AARect

  constructor({ x, y, power, index }: IBreakoutBrickConfig) {
    this.x = x
    this.y = y
    this.power = power
    this.index = index
    this.bounds = new AARect({
      x: x - BALL_RADIUS,
      y: y - BALL_RADIUS,
      width: 1 + 2 * BALL_RADIUS,
      height: 1 + 2 * BALL_RADIUS,
    })
  }

  intersectWithBall(ballCenter: Vec2D, ballDirection: IPlainVec2D): IBreakoutIntersection | undefined {
    const int = computeBallIntersectionWithFigure(ballCenter, ballDirection, this, this.bounds)

    if (int === undefined) {
      return undefined
    }

    return { ...int, brickIndex: this.index }
  }

  evolve() {
    if (this.power >= BRICK_MAX_POWER) {
      throw new BreakoutBrickError(`Cannot evolve brick at ${this.x}×${this.y} with power ${this.power}`)
    }

    return new BreakoutBrick({
      x: this.x,
      y: this.y,
      index: this.index,
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
      index: this.index,
      power: this.power - 1 as GameBrickPower,
    })
  }
}
