import { type Vec2D } from '../../../common/math/geom2d.ts'
import { s } from '../../../common/rendering/component.ts'
import { BALL_RADIUS } from '../constants.ts'

interface IBreakoutBallState {
  ballCenter: Vec2D
}

export function breakoutBall({ ballCenter }: IBreakoutBallState) {
  return s('circle', {
    class: 'breakout-ball',
    cx: String(ballCenter.x),
    cy: String(ballCenter.y),
    r: BALL_RADIUS,
  })
}
