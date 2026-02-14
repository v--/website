import { createComponent as c } from '../../../common/rendering/component.ts'
import { PADDLE_HEIGHT, PADDLE_WIDTH, STAGE } from '../constants.ts'
import { type BreakoutPaddle } from '../geom/paddle.ts'

interface IBreakoutPaddleState {
  paddle: BreakoutPaddle
}

export function breakoutPaddle({ paddle }: IBreakoutPaddleState) {
  return c.svg('ellipse', {
    class: 'breakout-paddle',
    cx: String(paddle.center),
    cy: String(STAGE.getBottomPos()),
    rx: String(PADDLE_WIDTH),
    ry: String(PADDLE_HEIGHT),
  })
}
