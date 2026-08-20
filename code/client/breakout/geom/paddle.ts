import { STAGE } from './stage.js'
import { AAEllipse } from '../../../common/math/geom2d.js'
import { type float64 } from '../../../common/types/numbers.js'
import { BALL_RADIUS, PADDLE_HEIGHT, PADDLE_TRACE_WIDTH_CORRECTION, PADDLE_WIDTH } from '../constants.js'

export function getPaddleEllipse(center: float64) {
  return new AAEllipse({
    x0: center,
    y0: STAGE.getBottomPos(),
    a: PADDLE_WIDTH + PADDLE_TRACE_WIDTH_CORRECTION * BALL_RADIUS,
    b: PADDLE_HEIGHT + BALL_RADIUS,
  })
}
