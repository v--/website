import { BALL_RADIUS, BRICK_MAX_POWER } from './constants.ts'
import { BreakoutBrickError } from './errors.ts'
import { BreakoutBall } from './geom/ball.ts'
import { type GameBrickPower, type IBreakoutIntersection } from './types.ts'
import { AARect } from '../../common/math/geom2d.ts'
import { type uint32 } from '../../common/types/numbers.ts'

export interface IBreakoutBrickConfig {
  x: uint32
  y: uint32
  power: GameBrickPower
}

export class BreakoutBrick implements IBreakoutBrickConfig {
  readonly x: uint32
  readonly y: uint32
  readonly power: GameBrickPower
  readonly bounds: AARect

  constructor({ x, y, power }: IBreakoutBrickConfig) {
    this.x = x
    this.y = y
    this.power = power
    this.bounds = new AARect({
      x: x - BALL_RADIUS,
      y: y - BALL_RADIUS,
      width: 1 + 2 * BALL_RADIUS,
      height: 1 + 2 * BALL_RADIUS,
    })
  }

  intersectWithBall(ball: BreakoutBall): IBreakoutIntersection | undefined {
    return ball.computeIntersectionWithFigure(this, this.bounds)
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
