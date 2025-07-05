import { AAEllipse, type IIntersection, Vec2D } from '../../../common/math/geom2d.ts'
import { schwartzMin } from '../../../common/support/iteration.ts'
import { type float64 } from '../../../common/types/numbers.ts'
import { type BreakoutBrick } from '../brick.ts'
import { PADDLE_HEIGHT, PADDLE_WIDTH, STAGE } from '../constants.ts'
import { BreakoutReflectionError } from '../errors.ts'

function* iterIntersections(origin: Vec2D, direction: Vec2D, paddleCenter: float64, bricks: BreakoutBrick[]): Generator<IIntersection | undefined> {
  yield STAGE.intersectWithRay(origin, direction)

  for (const brick of bricks) {
    yield brick.intersectWithRay(origin, direction)
  }

  const ellipse = new AAEllipse({ x0: paddleCenter, y0: STAGE.height, a: PADDLE_WIDTH, b: PADDLE_HEIGHT })
  yield ellipse.intersectWithRay(origin, direction)
}

export function findClosestIntersection(origin: Vec2D, direction: Vec2D, paddleCenter: float64, bricks: BreakoutBrick[]): IIntersection | undefined {
  return schwartzMin(
    int => int ? origin.distanceTo(int.point) : Number.POSITIVE_INFINITY,
    iterIntersections(origin, direction, paddleCenter, bricks),
  )
}

export function reflectDirectionThroughIntersection(origin: Vec2D, direction: Vec2D, brickInt: IIntersection): Vec2D {
  const reflectedDirection = brickInt.tangent.reflectRayDirection(origin, direction)

  if (reflectedDirection === undefined) {
    throw new BreakoutReflectionError('Could not reflect moving point')
  }

  return reflectedDirection
}
