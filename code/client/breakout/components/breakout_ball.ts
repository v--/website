import { createComponent as c } from '../../../common/rendering/component.ts'
import { BALL_RADIUS } from '../constants.ts'
import { type BreakoutBall } from '../geom/ball.ts'

interface IBreakoutBallState {
  ball: BreakoutBall
}

export function breakoutBall({ ball }: IBreakoutBallState) {
  return c.svg('circle', {
    class: 'breakout-ball',
    cx: String(ball.center.x),
    cy: String(ball.center.y),
    r: BALL_RADIUS,
  })
}
