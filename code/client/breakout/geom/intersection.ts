import { STAGE, STAGE_INTERSECTION_BOUNDS } from './stage.ts'
import { AARect, type IIntersection, type IPlainVec2D, Vec2D } from '../../../common/math/geom2d.ts'
import { isClose } from '../../../common/support/floating.ts'
import { schwartzMin } from '../../../common/support/iteration.ts'
import { type float64 } from '../../../common/types/numbers.ts'
import { BALL_RADIUS } from '../constants.ts'
import { type IBreakoutIntersection, type IBrickState } from '../types.ts'
import { getPaddleEllipse } from './paddle.ts'

interface IFigureGeomIntersection {
  int?: IIntersection
  brick?: IBrickState
  isLastHit?: boolean
  isStageBottom?: boolean
}

function getStageGeomIntersection(ballSource: Vec2D, ballDirection: IPlainVec2D): IFigureGeomIntersection {
  const int = STAGE_INTERSECTION_BOUNDS.intersectWithRay(ballSource, ballDirection)

  return {
    int,
    isStageBottom: int && isClose(int.point.y, STAGE_INTERSECTION_BOUNDS.getBottomPos()),
  }
}

function getPaddleGeomIntersection(ballSource: Vec2D, ballDirection: IPlainVec2D, paddleCenter: float64): IFigureGeomIntersection {
  const int = getPaddleEllipse(paddleCenter).intersectWithRay(ballSource, ballDirection)

  if (int === undefined) {
    return {
      int: undefined,
    }
  }

  return {
    int: {
      point: new Vec2D({ x: int.point.x, y: Math.min(int.point.y, STAGE.getBottomPos() - BALL_RADIUS) }),
      calculateReflectedDirection() {
        // Due to a combination of numerical errors and intricacies of elliptic reflection,
        // reflection at the edge of the paddle seemingly misbehaves.
        // We make sure the reflected direction always points away from the bottom.
        const reflDir = int.calculateReflectedDirection()
        return new Vec2D({ x: reflDir.x, y: -Math.abs(reflDir.y) })
      },
    },
  }
}

function getBrickGeomIntersection(ballSource: Vec2D, ballDirection: IPlainVec2D, brick: IBrickState): IFigureGeomIntersection {
  const bounds = new AARect({
    x: brick.x - BALL_RADIUS,
    y: brick.y - BALL_RADIUS,
    width: 1 + 2 * BALL_RADIUS,
    height: 1 + 2 * BALL_RADIUS,
  })

  return {
    int: bounds.intersectWithRay(ballSource, ballDirection),
    brick: brick,
  }
}

export function* iterGeomIntersections(ballSource: Vec2D, ballDirection: IPlainVec2D, paddleCenter: float64, bricks: IBrickState[]): Generator<IFigureGeomIntersection> {
  for (const brick of bricks) {
    yield getBrickGeomIntersection(ballSource, ballDirection, brick)
  }

  yield getPaddleGeomIntersection(ballSource, ballDirection, paddleCenter)
  yield getStageGeomIntersection(ballSource, ballDirection)
}

function findClosestGeomIntersection(ballSource: IPlainVec2D, ballDirection: IPlainVec2D, paddleCenter: float64, bricks: IBrickState[]): IFigureGeomIntersection {
  const source = new Vec2D(ballSource)
  return schwartzMin(
    ({ int }) => int ? source.distanceTo(int.point) : Number.POSITIVE_INFINITY,
    iterGeomIntersections(source, ballDirection, paddleCenter, bricks),
  )
}

export function findClosestBreakoutIntersection(ballSource: IPlainVec2D, ballDirection: IPlainVec2D, paddleCenter: float64, bricks: IBrickState[]): IBreakoutIntersection {
  const { int, isStageBottom, brick } = findClosestGeomIntersection(ballSource, ballDirection, paddleCenter, bricks)

  return {
    newCenter: int!.point,
    reflectedDirection: int!.calculateReflectedDirection(),
    brick,
    isLastHit: bricks.length === 1 && brick !== undefined && brick.power == 1,
    isStageBottom,
  }
}
