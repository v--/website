import GameState from '../enums/game_state.js'
import { MOVEMENT_DELTA } from '../constants.js'
import { add, scale } from '../geom/vector.js'

import GameEntity from '../entity/game_entity.js'
import PaddleEntity from '../entity/paddle_entity.js'

const GAME = new GameEntity()

export default function moveBall (subject) {
  const { eventLoop, ball, paddleX } = subject.value

  const next = {
    center: add(ball.center, scale(ball.direction, MOVEMENT_DELTA)),
    direction: ball.direction
  }

  const paddle = new PaddleEntity(paddleX)
  const entities = [paddle, GAME]

  for (const entity of entities) {
    if (entity.collides(next)) {
      const collision = entity.predictCollision(ball)
      const newGameState = collision.getStateUpdates()
      subject.update(newGameState)

      if ('state' in newGameState && newGameState.state !== GameState.RUNNING) {
        eventLoop.stop()
      }

      return
    }
  }

  const delta = scale(ball.direction, MOVEMENT_DELTA)
  subject.update({
    ball: {
      center: add(ball.center, delta),
      direction: ball.direction
    }
  })
}
