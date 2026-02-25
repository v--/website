import { BreakoutBall } from './ball.ts'
import { AAEllipse, Vec2D } from '../../../common/math/geom2d.ts'
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
      y0: STAGE.getBottomPos(),
      a: PADDLE_WIDTH + BALL_RADIUS,
      b: PADDLE_HEIGHT + BALL_RADIUS,
    })
  }

  intersectWithBall(ball: BreakoutBall): IBreakoutIntersection | undefined {
    const int = this.ellipse.intersectWithRay(ball.center, ball.direction)

    if (int) {
      return {
        newCenter: int.point,
        figure: this,
        calculateBallReflection() {
          // We make sure the reflected direction always points away from the bottom.
          // This deviates from correct elliptic reflection, but without this correction the game is perceived to misbehave.
          const reflDir = int.calculateReflection()
          const correctedDir = new Vec2D({ x: reflDir.x, y: -Math.abs(reflDir.y) })
          return new BreakoutBall({ center: int.point, direction: correctedDir })
        },
      }
    }

    return undefined
  }

  update(config: Partial<IBreakoutPaddleConfig>) {
    return new BreakoutPaddle({ ...this, ...config })
  }
}
