import { type Vec2D } from '../../../common/math/geom2d.ts'
import { type uint32 } from '../../../common/types/numbers.ts'
import { type IBreakoutIntersection } from '../types.ts'
import { type BreakoutBrick } from './brick.ts'
import { findClosestIntersection, isIntersectionFatal, isIntersectionWinning } from './intersection.ts'
import { type BreakoutPaddle } from './paddle.ts'

const MAX_TRAJECTORY_LENGTH = 4

export interface IBreakoutTrajectory {
  head: Vec2D
  tail: IBreakoutIntersection[]
}

export function computeBreakoutTrajectory(
  head: Vec2D,
  first: IBreakoutIntersection,
  paddle: BreakoutPaddle,
  bricks: BreakoutBrick[],
  maxLength: uint32 = MAX_TRAJECTORY_LENGTH,
): IBreakoutTrajectory {
  const tail: IBreakoutIntersection[] = []

  for (let i = 0, int: IBreakoutIntersection | undefined = first; i < maxLength && int && bricks.length > 0; i++) {
    tail.push(int)

    if (isIntersectionFatal(int) || isIntersectionWinning(int, bricks)) {
      break
    }

    const refl = int.calculateReflectedDirection()
    int = findClosestIntersection(int.newCenter, refl, paddle, bricks)
  }

  return { head, tail }
}
