import GameState from '../enums/game_state.js'
import { collide } from '../collision.js'
import { WIDTH, PADDLE_WIDTH, DEFAULT_BALL_POS, DEFAULT_BALL_ANGLE } from '../constants.js'

const HALF_WIDTH = WIDTH / 2 - PADDLE_WIDTH

function ballMovement (subject, period) {
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
            ballMovement(subject, period)
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
            ballMovement(subject, period)
          })
        )
        break

      case GameState.COMPLETED:
        subject.update({
          state: GameState.UNSTARTED,
          paddleX: 0,
          blocks: [],
          ballPos: DEFAULT_BALL_POS,
          angle: DEFAULT_BALL_ANGLE,
          score: 0
        })

        break
    }
  }

  if (key === 'ArrowLeft' && !eventLoopSubscriptions.has('paddleLeft')) {
    eventLoopSubscriptions.set(
      'paddleLeft',
      eventLoop.subscribe(function (period) {
        const oldX = subject.value.paddleX
        const delta = period / 60

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
        const delta = period / 60

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
