import GameState from '../enums/game_state.js'
import { collide } from '../collision.js'
import { scale, add, sub } from '../geom/vector.js'
import { GAME_SIZE, PADDLE_SIZE, BALL_RADIUS, DEFAULT_BALL_POSITION, DEFAULT_BALL_DIRECTION, DEFAULT_BRICKS, PERIOD_ADJUSTMENT, NEW_BRICK_PERIOD } from '../constants.js'

const HALF_WIDTH = GAME_SIZE.x / 2 - PADDLE_SIZE.x
let timeSinceLastBrick = null

function ballMovement (subject, delta) {
  const { eventLoopSubscriptions, score, ball, direction, paddleX, bricks } = subject.value
  const collision = collide(ball, direction, paddleX, bricks)

  if (collision === null) {
    return
  }

  function tryAddNewBrick (newBricks) {
    if (Date.now() - timeSinceLastBrick >= NEW_BRICK_PERIOD) {
      timeSinceLastBrick = Date.now()
      const newBrick = {
        x: Math.round(Math.random() * GAME_SIZE.x) - GAME_SIZE.x,
        y: Math.round(Math.random() * GAME_SIZE.y / 2)
      }

      if (bricks.every(brick => brick.x !== newBrick.x && brick.y !== newBrick.y)) {
        newBricks.push(newBrick)
      }
    }
  }

  if (collision.dist > delta + 2 * BALL_RADIUS) {
    tryAddNewBrick(bricks)
    subject.update({
      ball: add(ball, scale(direction, delta)),
      bricks
    })
  } else if (collision.intersection.y === GAME_SIZE.y) {
    eventLoopSubscriptions.get('ball').unsubscribe()
    eventLoopSubscriptions.delete('ball')
    subject.update({
      state: GameState.GAME_OVER,
      ball: {
        x: collision.intersection.x - direction.x * BALL_RADIUS,
        y: GAME_SIZE.y - BALL_RADIUS
      }
    })
  } else {
    const newBricks = bricks.filter(brick => brick !== collision.brick)
    const newScore = score + (bricks.length - newBricks.length)

    if (newBricks.length > 0) {
      tryAddNewBrick(newBricks)
    } else {
      eventLoopSubscriptions.get('ball').unsubscribe()
      eventLoopSubscriptions.delete('ball')
    }

    subject.update({
      state: newBricks.length > 0 ? GameState.RUNNING : GameState.COMPLETED,
      direction: collision.direction,
      bricks: newBricks,
      score: newScore,
      ball: sub(collision.intersection, scale(direction, BALL_RADIUS))
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

      case GameState.GAME_OVER:
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
