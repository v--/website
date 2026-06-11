import { type Vec2D } from '../../../common/math/geom2d.ts'
import { createComponent as c } from '../../../common/rendering/component.ts'
import { BALL_RADIUS } from '../constants.ts'

interface IBreakoutBallState {
  ballCenter: Vec2D
}

export function breakoutBall({ ballCenter }: IBreakoutBallState) {
  return c.svg('circle', {
    class: 'breakout-ball',
    cx: String(ballCenter.x),
    cy: String(ballCenter.y),
    r: BALL_RADIUS,
  })
}
