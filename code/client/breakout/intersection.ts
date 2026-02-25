import { type BreakoutBrick } from './brick.ts'
import { BALL_RADIUS, STAGE } from './constants.ts'
import { type BreakoutBall } from './geom/ball.ts'
import { BreakoutPaddle } from './geom/paddle.ts'
import { BreakoutStage } from './geom/stage.ts'
import { type IBreakoutIntersection } from './types.ts'
import { isClose } from '../../common/support/floating.ts'
import { schwartzMin } from '../../common/support/iteration.ts'

export function* iterIntersections(ball: BreakoutBall, paddle: BreakoutPaddle, bricks: BreakoutBrick[]): Generator<IBreakoutIntersection> {
  for (const intersectible of [...bricks, STAGE]) {
    const int = intersectible.intersectWithBall(ball)

    if (int) {
      yield int
    }
  }
}

export function findClosestIntersection(ball: BreakoutBall, paddle: BreakoutPaddle, bricks: BreakoutBrick[]): IBreakoutIntersection | undefined {
  const paddleInt = paddle.intersectWithBall(ball)

  if (paddleInt) {
    return paddleInt
  }

  return schwartzMin(
    ({ point }) => ball.center.distanceTo(point),
    iterIntersections(ball, paddle, bricks),
  )
}

export function isIntersectionFatal(int: IBreakoutIntersection): boolean {
  return int.figure instanceof BreakoutStage && isClose(int.point.y + BALL_RADIUS, STAGE.getBottomPos())
}
