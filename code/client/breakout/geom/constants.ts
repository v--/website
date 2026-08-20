import { BALL_RADIUS } from '../constants.ts'
import { BreakoutStage } from './stage.ts'

// All sizes are part of the following grid:
export const STAGE = new BreakoutStage({
  width: 18,
  height: 12,
  x: -9,
  y: 0,
  offset: BALL_RADIUS,
})
