import { createComponent as c } from '../../../common/rendering/component.ts'
import { type float64 } from '../../../common/types/numbers.ts'
import { PADDLE_HEIGHT, PADDLE_WIDTH } from '../constants.ts'
import { STAGE } from '../geom/stage.ts'

interface IBreakoutPaddleState {
  paddleCenter: float64
}

export function breakoutPaddle({ paddleCenter }: IBreakoutPaddleState) {
  return c.svg('ellipse', {
    class: 'breakout-paddle',
    cx: String(paddleCenter),
    cy: String(STAGE.getBottomPos()),
    rx: String(PADDLE_WIDTH),
    ry: String(PADDLE_HEIGHT),
  })
}
