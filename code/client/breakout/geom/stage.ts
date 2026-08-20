import { AARect } from '../../../common/math/geom2d.ts'
import { BALL_RADIUS } from '../constants.ts'

// All sizes are part of the following grid:
export const STAGE = new AARect({
  x: -9,
  y: 0,
  width: 18,
  height: 12,
})

export const STAGE_INTERSECTION_BOUNDS = new AARect({
  x: STAGE.x + BALL_RADIUS,
  y: STAGE.y + BALL_RADIUS,
  width: STAGE.width - 2 * BALL_RADIUS,
  height: STAGE.height - BALL_RADIUS,
})
