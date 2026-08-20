import { createComponent as c } from '../../../common/rendering/component.ts'
import { type float64 } from '../../../common/types/numbers.ts'
import { PADDLE_HEIGHT, PADDLE_OFFSET, PADDLE_WIDTH } from '../constants.ts'
import { STAGE } from '../geom/stage.ts'

interface IBreakoutPaddleState {
  paddleCenter: float64
}

export function breakoutPaddle({ paddleCenter }: IBreakoutPaddleState) {
  return c.svg('g', { class: 'breakout-paddle' },
    c.svg('ellipse', {
      cx: String(paddleCenter),
      cy: String(STAGE.getBottomPos() - PADDLE_OFFSET),
      rx: String(PADDLE_WIDTH),
      ry: String(PADDLE_HEIGHT),
    }),

    c.svg('rect', {
      y: String(STAGE.getBottomPos() - PADDLE_OFFSET),
      x: String(paddleCenter - PADDLE_WIDTH),
      width: String(2 * PADDLE_WIDTH),
      height: String(PADDLE_OFFSET),
    }),
  )
}
