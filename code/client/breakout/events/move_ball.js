import { EPSILON, MOVEMENT_DELTA, REFLECTION_ADJUSTMENT } from '../constants.js'
import GameStatus from '../enums/game_status.js'
import Reflection from '../support/reflection.js'
import { changeBrick, removeBrick } from '../support/bricks.js'
import GameBrick from '../geom/game_brick.js'

function * generateReflections (stage, paddle, ball, bricks) {
  const paddleReflection = paddle.reflectBall(ball)

  if (paddleReflection !== null) {
    yield paddleReflection
  }

  const stageReflection = stage.reflectBall(ball)

  if (stageReflection !== null) {
    yield stageReflection
  }

  for (const brick of bricks) {
    const brickReflection = brick.reflectBall(ball)

    if (brickReflection !== null) {
      yield brickReflection
    }
  }
}

export default function moveBall (subject) {
  const { eventLoop, score, stage, paddle, ball, bricks } = subject.value

  let reflected = null
  let nextReflected = new Reflection(ball, null)

  let delta = null
  let nextDelta = MOVEMENT_DELTA

  let newBricks = bricks
  let newScore = score
  let newStatus = GameStatus.RUNNING

  while (nextDelta > 0) {
    reflected = nextReflected

    if (reflected.figure instanceof GameBrick) {
      const newBrick = reflected.figure.hit()
      newBricks = newBrick === null ? removeBrick(newBricks, reflected.figure) : changeBrick(newBricks, reflected.figure, newBrick)
      newScore++
    }

    if (newBricks.length === 0) {
      eventLoop.stop()
      newStatus = GameStatus.COMPLETED
    }

    const reflections = Array.from(generateReflections(stage, paddle, reflected.ball, newBricks))
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
  } else if (reflected.ball.center.y + ball.radius >= stage.size.y - EPSILON) {
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
