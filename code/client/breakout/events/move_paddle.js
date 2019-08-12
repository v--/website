import GameState from '../enums/game_state.js'
import { GAME_SIZE, PADDLE_SIZE, MOVEMENT_DELTA } from '../constants.js'

const HALF_WIDTH = GAME_SIZE.x / 2 - PADDLE_SIZE.x

export default function movePaddle (subject) {
  const { state, paddleX, paddleDirection } = subject.value

  if (state !== GameState.RUNNING || paddleDirection === 0) {
    return
  }

  const newX = paddleX + paddleDirection * MOVEMENT_DELTA
  const edge = paddleDirection * HALF_WIDTH

  if ((paddleDirection < 0 && newX >= edge) || (paddleDirection > 0 && newX <= edge)) {
    subject.update({ paddleX: newX })
  } else if (newX !== edge) {
    subject.update({ paddleX: edge })
  }
}
