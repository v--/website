import { isGreaterThan } from '../../../common/math/numeric/floating.js'

import { MOVEMENT_DELTA, REFLECTION_ADJUSTMENT } from '../constants.js'
import { GameStatus } from '../enums/game_status.js'
import { changeBrick, removeBrick } from '../support/bricks.js'
import { Reflection } from '../geom/game_ball.js'
import { GameBrick } from '../geom/game_brick.js'

function * generateReflections (stage, paddle, ball, bricks) {
  const paddleReflection = ball.reflectInEllipse(paddle)

  if (paddleReflection !== null) {
    yield paddleReflection
  }

  const stageReflection = ball.reflectInRect(stage)

  if (stageReflection !== null) {
    yield stageReflection
  }

  for (const brick of bricks) {
    const brickReflection = ball.reclectInGameBrick(brick)

    if (brickReflection !== null) {
      yield brickReflection
    }
  }
}

export function moveBall (subject) {
  const { eventLoop, score, stage, paddle, ball, bricks } = subject.value

  let reflected = null
  let nextReflected = new Reflection({ ball, figure: null })

  let delta = null
  let nextDelta = MOVEMENT_DELTA

  let newBricks = bricks
  let newScore = score
  let newStatus = GameStatus.RUNNING

  while (nextDelta > 0) {
    reflected = nextReflected

    if (reflected.figure instanceof GameBrick) {
      const newBrick = reflected.figure.getHit()
      newBricks = newBrick === null ? removeBrick(newBricks, reflected.figure) : changeBrick(newBricks, reflected.figure, newBrick)
      newScore++
    }

    if (newBricks.length === 0) {
      eventLoop.stop()
      newStatus = GameStatus.COMPLETED
    }

    const reflections = generateReflections(stage, paddle, reflected.ball, newBricks)
    nextReflected = reflected.ball.findClosestReflection(reflections)

    delta = nextDelta
    nextDelta -= nextReflected.ball.center.distanceTo(reflected.ball.center)
  }

  if (reflected.figure === null) {
    subject.update({
      status: newStatus,
      score: newScore,
      bricks: newBricks,
      ball: ball.translate(delta)
    })
  } else if (isGreaterThan(reflected.ball.center.y + ball.radius, stage.dims.y)) {
    eventLoop.stop()
    subject.update({
      status: GameStatus.GAME_OVER,
      score: newScore,
      bricks: newBricks,
      ball: reflected.ball
    })
  } else {
    subject.update({
      status: newStatus,
      score: newScore,
      bricks: newBricks,
      ball: reflected.ball.translate(delta * REFLECTION_ADJUSTMENT)
    })
  }
}
