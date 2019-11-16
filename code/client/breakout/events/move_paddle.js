import { Vector } from '../../../common/math/geom2d/vector.js'
import { Ellipse } from '../../../common/math/geom2d/ellipse.js'

import { MOVEMENT_DELTA } from '../constants.js'
import { GameStatus } from '../enums/game_status.js'

export function movePaddle (subject) {
  const { status, ball, stage, paddle, paddleDirection } = subject.value

  if (status !== GameStatus.RUNNING || paddleDirection === 0) {
    return
  }

  const candidateX = paddle.center.x + paddleDirection * MOVEMENT_DELTA

  if (Math.abs(ball.center.y - paddle.center.y) < Math.max(2 * ball.radius, paddle.axes.y) && Math.abs(candidateX - ball.center.x) < paddle.axes.x + ball.radius) {
    return
  }

  const edge = paddleDirection * (stage.size.x / 2 - paddle.axes.x)

  const newX = (paddleDirection < 0 && candidateX >= edge) || (paddleDirection > 0 && candidateX <= edge) ? candidateX : edge
  const newPaddle = new Ellipse(new Vector(newX, paddle.center.y), paddle.axes)

  subject.update({ paddle: newPaddle })
}
