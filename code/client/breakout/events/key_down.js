import GameState from '../enums/game_state.js'
import { collide } from '../collision.js'
import { scale, add } from '../geom/vector.js'
import { GAME_SIZE, PADDLE_SIZE, BALL_RADIUS, DEFAULT_BALL_POSITION, DEFAULT_BALL_DIRECTION, DEFAULT_BRICKS, PERIOD_ADJUSTMENT } from '../constants.js'

const HALF_WIDTH = GAME_SIZE.x / 2 - PADDLE_SIZE.x

function ballMovement (subject, delta) {
  const { eventLoopSubscriptions, ball, direction, bricks } = subject.value
  const collision = collide(ball, direction, bricks)

  if (collision === null) {
    return
  }

  if (collision.dist > delta + 2 * BALL_RADIUS) {
    subject.update({
      ball: add(ball, scale(direction, delta))
    })
  } else {
    if (collision.intersection.y === GAME_SIZE.y) {
      eventLoopSubscriptions.get('ball').unsubscribe()
      eventLoopSubscriptions.delete('ball')
      subject.update({
        state: GameState.COMPLETED
      })
    }

    subject.update({
      direction: collision.direction,
      ball: collision.intersection
    })
  }
}

export default function onKeyDown (key, subject) {
  const { eventLoop, eventLoopSubscriptions } = subject.value

  if (key === ' ') {
    switch (subject.value.state) {
      case GameState.UNSTARTED:
        subject.update({ state: GameState.RUNNING })
        eventLoopSubscriptions.set(
          'ball',
          eventLoop.subscribe(function (period) {
            ballMovement(subject, period / PERIOD_ADJUSTMENT)
          })
        )
        break

      case GameState.RUNNING:
        subject.update({ state: GameState.PAUSED })
        eventLoopSubscriptions.get('ball').unsubscribe()
        eventLoopSubscriptions.delete('ball')
        break

      case GameState.PAUSED:
        subject.update({ state: GameState.RUNNING })
        eventLoopSubscriptions.set(
          'ball',
          eventLoop.subscribe(function (period) {
            ballMovement(subject, period / PERIOD_ADJUSTMENT)
          })
        )
        break

      case GameState.COMPLETED:
        subject.update({
          state: GameState.RUNNING,
          paddleX: 0,
          bricks: DEFAULT_BRICKS,
          ball: DEFAULT_BALL_POSITION,
          direction: DEFAULT_BALL_DIRECTION,
          score: 0
        })
        eventLoopSubscriptions.set(
          'ball',
          eventLoop.subscribe(function (period) {
            ballMovement(subject, period / PERIOD_ADJUSTMENT)
          })
        )

        break
    }
  }

  if (key === 'ArrowLeft' && !eventLoopSubscriptions.has('paddleLeft')) {
    eventLoopSubscriptions.set(
      'paddleLeft',
      eventLoop.subscribe(function (period) {
        const oldX = subject.value.paddleX
        const delta = period / PERIOD_ADJUSTMENT

        if (subject.value.state === GameState.RUNNING) {
          if (oldX - delta >= -HALF_WIDTH) {
            subject.update({ paddleX: oldX - delta })
          } else if (oldX - delta !== -HALF_WIDTH) {
            subject.update({ paddleX: -HALF_WIDTH })
          }
        }
      })
    )
  }

  if (key === 'ArrowRight' && !eventLoopSubscriptions.has('paddleRight')) {
    eventLoopSubscriptions.set(
      'paddleRight',
      eventLoop.subscribe(function (period) {
        const oldX = subject.value.paddleX
        const delta = period / PERIOD_ADJUSTMENT

        if (subject.value.state === GameState.RUNNING) {
          if (oldX + delta <= HALF_WIDTH) {
            subject.update({ paddleX: oldX + delta })
          } else if (oldX + delta !== HALF_WIDTH) {
            subject.update({ paddleX: HALF_WIDTH })
          }
        }
      })
    )
  }
}
