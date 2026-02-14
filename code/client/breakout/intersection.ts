import { type BreakoutBrick } from './brick.ts'
import { BALL_RADIUS, STAGE } from './constants.ts'
import { BreakoutReflectionError } from './errors.ts'
import { type BreakoutBall } from './geom/ball.ts'
import { BreakoutPaddle } from './geom/paddle.ts'
import { BreakoutStage } from './geom/stage.ts'
import { type IBreakoutIntersectible, type IBreakoutIntersection } from './types.ts'
import { isClose } from '../../common/support/floating.ts'
import { schwartzMin } from '../../common/support/iteration.ts'

export function* iterIntersectibles(ball: BreakoutBall, paddle: BreakoutPaddle, bricks: BreakoutBrick[]): Generator<IBreakoutIntersectible> {
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

export function tryFindClosestIntersection(ball: BreakoutBall, paddle: BreakoutPaddle, bricks: BreakoutBrick[]): IBreakoutIntersection | undefined {
  return schwartzMin(
    ({ point }) => ball.center.distanceTo(point),
    iterIntersections(ball, paddle, bricks),
  )
}

export function findClosestIntersection(ball: BreakoutBall, paddle: BreakoutPaddle, bricks: BreakoutBrick[]): IBreakoutIntersection {
  const int = tryFindClosestIntersection(ball, paddle, bricks)

  if (int) {
    return int
  }

  throw new BreakoutReflectionError('The ray traced by the ball does not intersectWithBall any figure')
}

export function isIntersectionFatal(int: IBreakoutIntersection): boolean {
  return int.figure instanceof BreakoutStage && isClose(int.point.y + BALL_RADIUS, STAGE.getBottomPos())
}
