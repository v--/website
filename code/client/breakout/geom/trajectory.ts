import { findClosestIntersection, isIntersectionFatal, isIntersectionWinning } from './intersection.ts'
import { type IPlainVec2D } from '../../../common/math/geom2d.ts'
import { type float64, type uint32 } from '../../../common/types/numbers.ts'
import { type IBreakoutIntersection, type IBreakoutTrajectory, type IBrickState } from '../types.ts'

const MAX_TRAJECTORY_LENGTH = 4

export function computeBreakoutTrajectory(
  head: IPlainVec2D,
  first: IBreakoutIntersection,
  paddleCenter: float64,
  bricks: IBrickState[],
  maxLength: uint32 = MAX_TRAJECTORY_LENGTH,
): IBreakoutTrajectory {
  const tail: IBreakoutIntersection[] = []

  for (let i = 0, int: IBreakoutIntersection | undefined = first; i < maxLength && int && bricks.length > 0; i++) {
    tail.push(int)

    if (isIntersectionFatal(int) || isIntersectionWinning(int, bricks)) {
      break
    }

    const refl = int.reflectedDirection
    int = findClosestIntersection(
      int.newCenter,
      refl,
      paddleCenter,
      bricks,
    )
  }

  return { head, tail }
}
