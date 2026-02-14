import { clamp } from '../../../common/support/floating.ts'
import { type float64 } from '../../../common/types/numbers.ts'
import { PADDLE_MOVEMENT_PER_SECOND, PADDLE_WIDTH, STAGE } from '../constants.ts'
import { BreakoutPaddle } from '../geom/paddle.ts'
import { type IGameState } from '../types.ts'

export function evolvePaddle(state: IGameState): Partial<IGameState> | undefined {
  const { paddle, fps } = state

  const paddleMovement = PADDLE_MOVEMENT_PER_SECOND / fps
  const newPaddleCenter = calculateNewPaddleCenter(paddle, paddleMovement)

  if (newPaddleCenter !== paddle.center) {
    return {
      paddle: paddle.update({ center: newPaddleCenter }),
    }
  }
}

function calculateNewPaddleCenter(paddle: BreakoutPaddle, paddleMovement: float64) {
  return clamp(
    paddle.center + paddle.direction * paddleMovement,
    STAGE.getLeftPos() + PADDLE_WIDTH,
    STAGE.getRightPos() - PADDLE_WIDTH,
  )
}
