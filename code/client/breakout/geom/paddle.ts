import { AAEllipse, type IPlainVec2D, Vec2D } from '../../../common/math/geom2d.ts'
import { type float64 } from '../../../common/types/numbers.ts'
import { BALL_RADIUS, PADDLE_HEIGHT, PADDLE_WIDTH } from '../constants.ts'
import { type IBreakoutIntersectible, type IBreakoutIntersection } from '../types.ts'
import { STAGE } from './constants.ts'

export interface IBreakoutPaddleConfig {
  center: float64
}

/**
 * The upper semiellipse of an axis-aligned ellipse
 */
export class BreakoutPaddle implements IBreakoutPaddleConfig, IBreakoutIntersectible {
  readonly center: float64
  readonly ellipse: AAEllipse

  constructor({ center }: IBreakoutPaddleConfig) {
    this.center = center
    this.ellipse = new AAEllipse({
      x0: center,
      y0: STAGE.getBottomPos(),
      a: PADDLE_WIDTH + BALL_RADIUS,
      b: PADDLE_HEIGHT + BALL_RADIUS,
    })
  }

  containsPoint(point: Vec2D) {
    return this.ellipse.containsPoint(point)
  }

  intersectWithBall(ballSource: Vec2D, ballDirection: IPlainVec2D): IBreakoutIntersection | undefined {
    const int = this.ellipse.intersectWithRay(ballSource, ballDirection)

    if (int) {
      // We make sure the reflected direction always points away from the bottom.
      // This deviates from correct elliptic reflection, but without this correction the game is perceived to misbehave.
      const reflDir = int.calculateReflectedDirection()

      return {
        newCenter: int.point,
        reflectedDirection: new Vec2D({ x: reflDir.x, y: -Math.abs(reflDir.y) }),
      }
    }

    return undefined
  }

  update(config: Partial<IBreakoutPaddleConfig>) {
    return new BreakoutPaddle({ ...this, ...config })
  }
}
