import { BALL_MOVEMENT_PER_SECOND, MINIMAL_MOVEMENT_DISTANCE } from '../constants.ts'
import { type IGameState } from '../types.ts'

export function evolveBall(state: IGameState): Partial<IGameState> | undefined {
  const { ballSource, ballTarget, ballPosition, frameDuration } = state

  const diffVector = ballTarget.newCenter.sub(ballSource)
  const ballMovement = Math.max(MINIMAL_MOVEMENT_DISTANCE, BALL_MOVEMENT_PER_SECOND * frameDuration / 1000)
  const newPosition = Math.min(1.0, ballPosition + ballMovement / diffVector.getNorm())

  return { ballPosition: newPosition }
}
