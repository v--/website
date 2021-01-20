import { isGreaterThan } from '../../../common/math/numeric/floating.js'

import { MOVEMENT_DELTA, REFLECTION_ADJUSTMENT } from '../constants.js'
import { GameStatus } from '../enums/game_status.js'
import { changeBrick, removeBrick } from '../support/bricks.js'
import { GameBall, Reflection } from '../geom/game_ball.js'
import { GameBrick } from '../geom/game_brick.js'
import { Rectangle } from '../../../common/math/geom2d/rectangle.js'
import { Ellipse } from '../../../common/math/geom2d/ellipse.js'
import { IGameState } from '../game_state.js'
import { BreakoutError } from '../errors.js'
import { DictSubject } from '../../../common/observables/dict_subject.js'

class InvalidReflectionError extends BreakoutError {}

function * generateReflections(stage: Rectangle, paddle: Ellipse, ball: GameBall, bricks: GameBrick[]) {
  const paddleReflection = ball.reflectInEllipse(paddle)

  if (paddleReflection) {
    yield paddleReflection
  }

  const stageReflection = ball.reflectInRect(stage)

  if (stageReflection) {
    yield stageReflection
  }

  for (const brick of bricks) {
    const brickReflection = ball.reclectInGameBrick(brick)

    if (brickReflection) {
      yield brickReflection
    }
  }
}

export function moveBall(subject$: DictSubject<IGameState>) {
  const { eventLoop, score, stage, paddle, ball, bricks } = subject$.value

  let reflected: Reflection | undefined
  let nextReflected = new Reflection({ ball })

  let delta: Num.Float64 | undefined
  let nextDelta = MOVEMENT_DELTA

  let newBricks = bricks
  let newScore = score
  let newStatus = GameStatus.running

  while (nextDelta > 0) {
    reflected = nextReflected

    if (reflected.figure instanceof GameBrick) {
      const newBrick = reflected.figure.getHit()
      newBricks = newBrick ? changeBrick(newBricks, reflected.figure, newBrick) : removeBrick(newBricks, reflected.figure)
      newScore++
    }

    if (newBricks.length === 0) {
      eventLoop.stop()
      newStatus = GameStatus.completed
    }

    const reflections = generateReflections(stage, paddle, reflected.ball, newBricks)
    nextReflected = reflected.ball.findClosestReflection(reflections)!

    delta = nextDelta
    nextDelta -= nextReflected.ball.center.distanceTo(reflected.ball.center)
  }

  if (reflected === undefined) {
    throw new InvalidReflectionError('Could not reflect the ball on anything')
  } else if (reflected.figure === undefined) {
    subject$.update({
      status: newStatus,
      score: newScore,
      bricks: newBricks,
      ball: ball.translate(delta!)
    })
  } else if (isGreaterThan(reflected.ball.center.y + ball.radius, stage.dims.y)) {
    eventLoop.stop()
    subject$.update({
      status: GameStatus.gameOver,
      score: newScore,
      bricks: newBricks,
      ball: reflected.ball
    })
  } else {
    subject$.update({
      status: newStatus,
      score: newScore,
      bricks: newBricks,
      ball: reflected.ball.translate(delta! * REFLECTION_ADJUSTMENT)
    })
  }
}
