import { type BreakoutBrick } from './brick.ts'
import { STAGE } from './constants.ts'
import { type BreakoutBall } from './geom/ball.ts'
import { BreakoutPaddle } from './geom/paddle.ts'
import { BreakoutStage } from './geom/stage.ts'
import { type IBreakoutIntersectible, type IBreakoutIntersection } from './types.ts'
import { isGeq } from '../../common/support/floating.ts'
import { schwartzMin } from '../../common/support/iteration.ts'

function* iterIntersectibles(ball: BreakoutBall, paddle: BreakoutPaddle, bricks: BreakoutBrick[]): Generator<IBreakoutIntersectible> {
  yield* bricks
  yield paddle
  yield STAGE
}

export function* iterIntersections(ball: BreakoutBall, paddle: BreakoutPaddle, bricks: BreakoutBrick[]): Generator<IBreakoutIntersection> {
  for (const intersectible of iterIntersectibles(ball, paddle, bricks)) {
    const int = intersectible.intersectWithBall(ball)

    if (int) {
      yield int
    }
  }
}

export function findClosestIntersection(ball: BreakoutBall, paddle: BreakoutPaddle, bricks: BreakoutBrick[]): IBreakoutIntersection | undefined {
  return schwartzMin(
    ({ newCenter }) => ball.center.distanceTo(newCenter),
    iterIntersections(ball, paddle, bricks),
  )
}

export function isIntersectionFatal(int: IBreakoutIntersection): boolean {
  return int.figure instanceof BreakoutStage && isGeq(int.newCenter.y, STAGE.getBottomPos())
}
