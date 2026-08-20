import { clamp, isClose } from '../../../common/support/floating.ts'
import { type float64 } from '../../../common/types/numbers.ts'
import { getComputedState, refreshTarget } from '../computed.ts'
import { MINIMAL_MOVEMENT_DISTANCE, PADDLE_MOVEMENT_PER_SECOND, PADDLE_WIDTH } from '../constants.ts'
import { getPaddleEllipse } from '../geom/paddle.ts'
import { STAGE } from '../geom/stage.ts'
import { type IInternalGameState, type PaddleDirection } from '../types.ts'

export function evolvePaddle(state: IInternalGameState, paddleDirection: PaddleDirection): Partial<IInternalGameState> | undefined {
  const { paddleCenter, frameDuration } = state
  const { ballCenter } = getComputedState(state)

  const paddleMovement = Math.max(MINIMAL_MOVEMENT_DISTANCE, PADDLE_MOVEMENT_PER_SECOND * frameDuration / 1000)
  const newPaddleCenter = calculateNewPaddleCenter(paddleCenter, paddleDirection, paddleMovement)

  if (!isClose(newPaddleCenter, paddleCenter) && !getPaddleEllipse(newPaddleCenter).containsPoint(ballCenter)) {
    const newState = { paddleCenter: newPaddleCenter }
    Object.assign(newState, refreshTarget({ ...state }))
    return newState
  }

  return undefined
}

function calculateNewPaddleCenter(paddleCenter: float64, paddleDirection: PaddleDirection, paddleMovement: float64) {
  return clamp(
    paddleCenter + paddleDirection * paddleMovement,
    STAGE.getLeftPos() + PADDLE_WIDTH,
    STAGE.getRightPos() - PADDLE_WIDTH,
  )
}
