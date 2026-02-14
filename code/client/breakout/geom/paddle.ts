import { BreakoutBall, intersectBall } from './ball.ts'
import { AAEllipse } from '../../../common/math/geom2d.ts'
import { type float64 } from '../../../common/types/numbers.ts'
import { BALL_RADIUS, PADDLE_HEIGHT, PADDLE_WIDTH, STAGE } from '../constants.ts'
import { type IBreakoutIntersectible, type IBreakoutIntersection, type PaddleDirection } from '../types.ts'

export interface IBreakoutPaddleConfig {
  center: float64
  direction: PaddleDirection
}

/**
 * The upper semiellipse of an axis-aligned ellipse
 */
export class BreakoutPaddle implements IBreakoutPaddleConfig, IBreakoutIntersectible {
  readonly center: float64
  readonly direction: PaddleDirection
  readonly ellipse: AAEllipse

  constructor({ center, direction }: IBreakoutPaddleConfig) {
    this.center = center
    this.direction = direction
    this.ellipse = new AAEllipse({
      x0: center,
      y0: STAGE.height,
      a: PADDLE_WIDTH + BALL_RADIUS,
      b: PADDLE_HEIGHT + BALL_RADIUS,
    })
  }

  intersectWithBall(ball: BreakoutBall): IBreakoutIntersection | undefined {
    return intersectBall(this, this.ellipse, ball)
  }

  update(config: Partial<IBreakoutPaddleConfig>) {
    return new BreakoutPaddle({ ...this, ...config })
  }
}
