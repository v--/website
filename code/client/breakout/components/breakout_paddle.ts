import { s } from '../../../common/rendering/component.ts'
import { type float64 } from '../../../common/types/numbers.ts'
import { PADDLE_HEIGHT, PADDLE_WIDTH, STAGE } from '../constants.ts'

interface IBreakoutPaddleState {
  center: float64
}

export function breakoutPaddle({ center }: IBreakoutPaddleState) {
  return s('ellipse', {
    class: 'breakout-paddle',
    cx: String(center),
    cy: String(STAGE.getBottomPos()),
    rx: String(PADDLE_WIDTH),
    ry: String(PADDLE_HEIGHT),
  })
}
