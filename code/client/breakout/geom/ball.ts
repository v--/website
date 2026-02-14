import { type IIntersectible, Vec2D } from '../../../common/math/geom2d.ts'
import { type float64 } from '../../../common/types/numbers.ts'
import { BALL_RADIUS } from '../constants.ts'
import { type IBreakoutIntersectible, type IBreakoutIntersection } from '../types.ts'

export interface IBreakoutBallConfig {
  center: Vec2D
  direction: Vec2D
}

/**
 * The upper semiellipse of an axis-aligned ellipse
 */
export class BreakoutBall implements IBreakoutBallConfig {
  center: Vec2D
  direction: Vec2D

  constructor({ center, direction }: IBreakoutBallConfig) {
    this.center = center
    this.direction = direction
  }

  move(amount: float64) {
    return new BreakoutBall({
      center: this.center.translate(this.direction, amount),
      direction: this.direction,
    })
  }

  getHeadPoint() {
    return this.center.add(this.direction.scaleBy(BALL_RADIUS / 2))
  }
}

export function intersectBall(figure: IBreakoutIntersectible, geomFigure: IIntersectible, ball: BreakoutBall): IBreakoutIntersection | undefined {
  const int = geomFigure.intersectWithRay(ball.center, ball.direction)

  if (int) {
    return {
      point: int.point,
      figure: figure,
      calculateBallReflection() {
        return new BreakoutBall({ center: int.point, direction: int.calculateReflection() })
      },
    }
  }

  return undefined
}
