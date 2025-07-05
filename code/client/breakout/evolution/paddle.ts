import { clamp } from '../../../common/support/floating.ts'
import { type float64 } from '../../../common/types/numbers.ts'
import { PADDLE_MOVEMENT_PER_SECOND, PADDLE_WIDTH, STAGE } from '../constants.ts'
import { type IGameState, type PaddleDirection } from '../types.ts'

export function evolvePaddle(state: IGameState): Partial<IGameState> | undefined {
  const { paddleCenter, paddleDirection, fps } = state

  const paddleMovement = PADDLE_MOVEMENT_PER_SECOND / fps
  const newPaddleCenter = calculateNewPaddleCenter(paddleCenter, paddleDirection, paddleMovement)

  if (newPaddleCenter !== paddleCenter) {
    return {
      paddleCenter: newPaddleCenter,
    }
  }
}

function calculateNewPaddleCenter(paddleCenter: float64, paddleDirection: PaddleDirection, paddleMovement: float64) {
  return clamp(
    paddleCenter + paddleDirection * paddleMovement,
    STAGE.getLeftPos() + PADDLE_WIDTH,
    STAGE.getRightPos() - PADDLE_WIDTH,
  )
}
