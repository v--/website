import { type IIntersectible, type IPlainVec2D, type Vec2D } from '../../../common/math/geom2d.ts'
import { type IBreakoutIntersectible, type IBreakoutIntersection } from '../types.ts'

export function computeBallIntersectionWithFigure(
  ballSource: Vec2D,
  ballDirection: IPlainVec2D,
  figure: IBreakoutIntersectible,
  geomFigure: IIntersectible,
): IBreakoutIntersection | undefined {
  const int = geomFigure.intersectWithRay(ballSource, ballDirection)

  if (int) {
    return {
      newCenter: int.point,
      figure: figure,
      calculateReflectedDirection() {
        return int.calculateReflectedDirection()
      },
    }
  }

  return undefined
}
