import GameState from '../enums/game_state.js'
import { collide } from '../collision.js'
import { scale, add, sub } from '../geom/vector.js'
import { GAME_SIZE, BALL_RADIUS, MOVEMENT_DELTA } from '../constants.js'

export default function moveBall (subject) {
  const { eventLoop, score, ball, ballDirection, paddleX, bricks } = subject.value
  const collision = collide(ball, ballDirection, paddleX, bricks)

  if (collision === null) {
    return
  }

  if (collision.dist > MOVEMENT_DELTA + 2 * BALL_RADIUS) {
    subject.update({
      ball: add(ball, scale(ballDirection, MOVEMENT_DELTA)),
      bricks
    })
  } else if (collision.intersection.y === GAME_SIZE.y) {
    eventLoop.stop()
    subject.update({
      state: GameState.GAME_OVER,
      ball: {
        x: collision.intersection.x - ballDirection.x * BALL_RADIUS,
        y: GAME_SIZE.y - BALL_RADIUS
      }
    })
  } else {
    let newBricks = null
    let newState = null
    let newScore = null

    if (collision.brick) {
      collision.brick.power--
      newBricks = collision.brick.power === 0 ? bricks.filter(brick => brick !== collision.brick) : bricks
      newState = newBricks.length > 0 ? GameState.RUNNING : GameState.COMPLETED
      newScore = score + 1

      if (newState === GameState.COMPLETED) {
        eventLoop.stop()
      }
    } else {
      newBricks = bricks
      newState = GameState.RUNNING
      newScore = score
    }

    subject.update({
      ballDirection: collision.direction,
      state: newState,
      bricks: newBricks,
      score: newScore,
      ball: sub(collision.intersection, scale(ballDirection, BALL_RADIUS))
    })
  }
}
