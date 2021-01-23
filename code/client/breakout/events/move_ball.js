import { isGreaterThan } from '../../../common/math/numeric/floating.js'

import { MOVEMENT_DELTA, REFLECTION_ADJUSTMENT } from '../constants.js'
import { changeBrick, removeBrick } from '../support/bricks.js'
import { GameBall, Reflection } from '../geom/game_ball.js'
import { GameBrick } from '../geom/game_brick.js'
import { Rectangle } from '../../../common/math/geom2d/rectangle.js'
import { Ellipse } from '../../../common/math/geom2d/ellipse.js'
import { BreakoutError } from '../errors.js'
import { DictSubject } from '../../../common/observables/dict_subject.js'

class InvalidReflectionError extends BreakoutError {}

/**
 * @param {Rectangle} stage
 * @param {Ellipse} paddle
 * @param {GameBall} ball
 * @param {GameBrick[]} bricks
 */
function * generateReflections(stage, paddle, ball, bricks) {
  const paddleReflection = ball.reflectInEllipse(paddle)

  if (paddleReflection) {
    yield paddleReflection
  }

  const stageReflection = ball.reflectInRect(stage)

  if (stageReflection) {
    yield stageReflection
  }

  for (const brick of bricks) {
    const brickReflection = ball.reflectInGameBrick(brick)

    if (brickReflection) {
      yield brickReflection
    }
  }
}

/**
 * @param {DictSubject<TBreakout.IGameState>} subject$
 */
export function moveBall(subject$) {
  const { eventLoop, score, stage, paddle, ball, bricks } = subject$.value

  /** @type {Reflection | undefined} */
  let reflected
  let nextReflected = new Reflection({ ball, figure: undefined })

  /** @type {TNum.Float64 | undefined} */
  let delta
  let nextDelta = MOVEMENT_DELTA

  let newBricks = bricks
  let newScore = score

  /** @type {TBreakout.GameStatus} */
  let newStatus = 'running'

  while (nextDelta > 0) {
    reflected = nextReflected

    if (reflected.figure instanceof GameBrick) {
      const newBrick = reflected.figure.getHit()
      newBricks = newBrick ? changeBrick(newBricks, reflected.figure, newBrick) : removeBrick(newBricks, reflected.figure)
      newScore++
    }

    if (newBricks.length === 0) {
      eventLoop.stop()
      newStatus = 'completed'
    }

    const reflections = generateReflections(stage, paddle, reflected.ball, newBricks)
    nextReflected = /** @type {Reflection} */ (reflected.ball.findClosestReflection(reflections))

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
      ball: ball.translate(/** @type {TNum.Float64} */ (delta))
    })
  } else if (isGreaterThan(reflected.ball.center.y + ball.radius, stage.dims.y)) {
    eventLoop.stop()
    subject$.update({
      status: 'gameOver',
      score: newScore,
      bricks: newBricks,
      ball: reflected.ball
    })
  } else {
    subject$.update({
      status: newStatus,
      score: newScore,
      bricks: newBricks,
      ball: reflected.ball.translate(/** @type {TNum.Float64} */ (delta) * REFLECTION_ADJUSTMENT)
    })
  }
}
