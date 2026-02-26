import { clamp } from '../../../common/support/floating.ts'
import { type float64 } from '../../../common/types/numbers.ts'
import { MINIMAL_MOVEMENT_DISTANCE, PADDLE_MOVEMENT_PER_SECOND, PADDLE_WIDTH, STAGE } from '../constants.ts'
import { BreakoutPaddle } from '../geom/paddle.ts'
import { type IGameState } from '../types.ts'

export function evolvePaddle(state: IGameState): Partial<IGameState> | undefined {
  const { paddle, ball, fps } = state

  const paddleMovement = Math.max(MINIMAL_MOVEMENT_DISTANCE, PADDLE_MOVEMENT_PER_SECOND / fps)
  const newPaddleCenter = calculateNewPaddleCenter(paddle, paddleMovement)
  const newPaddle = paddle.update({ center: newPaddleCenter })

  if (newPaddleCenter !== paddle.center && !newPaddle.containsBall(ball)) {
    return { paddle: newPaddle }
  }
}

function calculateNewPaddleCenter(paddle: BreakoutPaddle, paddleMovement: float64) {
  return clamp(
    paddle.center + paddle.direction * paddleMovement,
    STAGE.getLeftPos() + PADDLE_WIDTH,
    STAGE.getRightPos() - PADDLE_WIDTH,
  )
}
