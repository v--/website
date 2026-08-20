import { BreakoutBrick } from './brick.ts'
import { BreakoutPaddle } from './paddle.ts'
import { type IPlainVec2D, Vec2D } from '../../../common/math/geom2d.ts'
import { isGeq } from '../../../common/support/floating.ts'
import { schwartzMin } from '../../../common/support/iteration.ts'
import { type IBreakoutIntersectible, type IBreakoutIntersection, type IBrickState } from '../types.ts'
import { STAGE } from './constants.ts'
import { type float64 } from '../../../common/types/numbers.ts'
import { BALL_RADIUS } from '../constants.ts'

function* iterIntersectibles(paddleCenter: float64, bricks: IBrickState[]): Generator<IBreakoutIntersectible> {
  for (let index = 0; index < bricks.length; index++) {
    const brickState = bricks[index]
    const brick = new BreakoutBrick({ ...brickState, index })
    yield new BreakoutBrick(brick)
  }

  yield new BreakoutPaddle({ center: paddleCenter })
  yield STAGE
}

export function* iterIntersections(ballSource: Vec2D, ballDirection: IPlainVec2D, paddleCenter: float64, bricks: IBrickState[]): Generator<IBreakoutIntersection> {
  for (const intersectible of iterIntersectibles(paddleCenter, bricks)) {
    const int = intersectible.intersectWithBall(ballSource, ballDirection)

    if (int) {
      yield int
    }
  }
}

export function findClosestIntersection(ballSource: IPlainVec2D, ballDirection: IPlainVec2D, paddleCenter: float64, bricks: IBrickState[]): IBreakoutIntersection | undefined {
  const source = new Vec2D(ballSource)

  return schwartzMin(
    ({ newCenter }) => source.distanceTo(newCenter),
    iterIntersections(source, ballDirection, paddleCenter, bricks),
  )
}

export function isIntersectionFatal(int: IBreakoutIntersection): boolean {
  return isGeq(int.newCenter.y + BALL_RADIUS, STAGE.getBottomPos())
}

export function isIntersectionWinning(int: IBreakoutIntersection, bricks: IBrickState[]): boolean {
  return int.brickIndex === 0 && bricks.length === 1 && bricks[0].power === 1
}
