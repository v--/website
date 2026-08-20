import { Vec2D } from '../../../common/math/geom2d.ts'
import { BALL_MOVEMENT_PER_SECOND, MINIMAL_MOVEMENT_DISTANCE } from '../constants.ts'
import { type IInternalGameState } from '../types.ts'

export function evolveBall(state: IInternalGameState): Partial<IInternalGameState> | undefined {
  const { ballSource, ballTarget, ballPosition, frameDuration } = state

  const diffVector = new Vec2D(ballTarget.newCenter).sub(ballSource)
  const ballMovement = Math.max(MINIMAL_MOVEMENT_DISTANCE, BALL_MOVEMENT_PER_SECOND * frameDuration / 1000)
  const newPosition = Math.min(1.0, ballPosition + ballMovement / diffVector.getNorm())

  return { ballPosition: newPosition }
}
