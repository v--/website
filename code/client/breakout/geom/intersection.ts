import { BreakoutBrick } from './brick.ts'
import { STAGE } from '../constants.ts'
import { BreakoutPaddle } from './paddle.ts'
import { BreakoutStage } from './stage.ts'
import { type IIntersectible, type IPlainVec2D, type Vec2D } from '../../../common/math/geom2d.ts'
import { isGeq } from '../../../common/support/floating.ts'
import { schwartzMin } from '../../../common/support/iteration.ts'
import { type IBreakoutIntersectible, type IBreakoutIntersection } from '../types.ts'

function* iterIntersectibles(paddle: BreakoutPaddle, bricks: BreakoutBrick[]): Generator<IBreakoutIntersectible> {
  yield* bricks
  yield paddle
  yield STAGE
}

export function* iterIntersections(ballSource: Vec2D, ballDirection: IPlainVec2D, paddle: BreakoutPaddle, bricks: BreakoutBrick[]): Generator<IBreakoutIntersection> {
  for (const intersectible of iterIntersectibles(paddle, bricks)) {
    const int = intersectible.intersectWithBall(ballSource, ballDirection)

    if (int) {
      yield int
    }
  }
}

export function findClosestIntersection(ballSource: Vec2D, ballDirection: IPlainVec2D, paddle: BreakoutPaddle, bricks: BreakoutBrick[]): IBreakoutIntersection | undefined {
  return schwartzMin(
    ({ newCenter }) => ballSource.distanceTo(newCenter),
    iterIntersections(ballSource, ballDirection, paddle, bricks),
  )
}

export function isIntersectionFatal(int: IBreakoutIntersection): boolean {
  return int.figure instanceof BreakoutStage && isGeq(int.newCenter.y, STAGE.getBottomPos())
}

export function isIntersectionWinning(int: IBreakoutIntersection, bricks: BreakoutBrick[]): boolean {
  return bricks.length === 1 && int.figure instanceof BreakoutBrick
}

export function computeBallIntersectionWithFigure(ballSource: Vec2D, ballDirection: IPlainVec2D, figure: IBreakoutIntersectible, geomFigure: IIntersectible): IBreakoutIntersection | undefined {
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
