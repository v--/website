import { Vec2D } from '../../../common/math/geom2d.ts'
import { BALL_RADIUS } from '../constants.ts'
import { BreakoutPaddle } from './paddle.ts'
import { BreakoutStage } from './stage.ts'

// All sizes are part of the following grid:
export const STAGE = new BreakoutStage({
  width: 18,
  height: 12,
  x: -9,
  y: 0,
  offset: BALL_RADIUS,
})

export const DEFAULT_BALL_SOURCE = new Vec2D({ x: 0.0, y: 3.5 })
export const DEFAULT_PADDLE = new BreakoutPaddle({
  center: 0.0,
  ordinate: STAGE.getBottomPos(),
  direction: 0,
})
