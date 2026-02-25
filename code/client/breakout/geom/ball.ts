import { type IIntersectible, Vec2D } from '../../../common/math/geom2d.ts'
import { schwartzMin } from '../../../common/support/iteration.ts'
import { type float64 } from '../../../common/types/numbers.ts'
import { BALL_CONTROL_POINT_ANGLES, BALL_RADIUS } from '../constants.ts'
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

  * #iterControlPointIntersections(figure: IBreakoutIntersectible, geomFigure: IIntersectible): Generator<IBreakoutIntersection> {
    for (const controlAngle of BALL_CONTROL_POINT_ANGLES) {
      const controlDir = this.direction.rotate(controlAngle)
      const controlPoint = this.center.translate(controlDir, BALL_RADIUS)
      const int = geomFigure.intersectWithRay(controlPoint, this.direction)

      if (int) {
        const translatedIntPoint = int.point.translate(controlDir, -BALL_RADIUS)

        yield {
          newCenter: translatedIntPoint,
          figure: figure,
          dist: controlPoint.distanceTo(int.point),
          calculateBallReflection() {
            return new BreakoutBall({ center: translatedIntPoint, direction: int.calculateReflection() })
          },
        }
      }
    }
  }

  computeIntersectionWithFigure(figure: IBreakoutIntersectible, geomFigure: IIntersectible): IBreakoutIntersection | undefined {
    return schwartzMin(
      ({ newCenter }) => this.center.distanceTo(newCenter),
      this.#iterControlPointIntersections(figure, geomFigure),
    )
  }
}
