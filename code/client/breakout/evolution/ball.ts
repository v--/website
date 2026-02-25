import { isLeq } from '../../../common/support/floating.ts'
import { BreakoutBrick } from '../brick.ts'
import { BALL_MOVEMENT_PER_SECOND } from '../constants.ts'
import { findClosestIntersection, isIntersectionFatal } from '../intersection.ts'
import { type IGameState } from '../types.ts'

export function evolveBall(state: IGameState): Partial<IGameState> {
  const { paddle, ball, bricks, score, fps } = state
  const ballMovement = BALL_MOVEMENT_PER_SECOND / fps

  let movementRemaining = ballMovement
  let newBall = ball
  let newBricks = bricks
  let newScore = score

  while (true) {
    const int = findClosestIntersection(newBall, paddle, bricks)

    // This shouldn't happen, so we either need to trigger a "game over" event or let the code crash.
    if (int === undefined) {
      return { phase: 'game_over' }
    }

    const intDist = newBall.center.distanceTo(int.newCenter)

    if (isLeq(movementRemaining, intDist)) {
      newBall = newBall.move(movementRemaining)
      break
    } else {
      if (isIntersectionFatal(int)) {
        newBall = newBall.move(intDist)

        return {
          phase: 'game_over',
          ball: newBall,
        }
      }

      if (int.figure instanceof BreakoutBrick) {
        const brick = int.figure
        const brickIndex = newBricks.indexOf(brick)
        newScore += 1

        if (brick.power > 1) {
          newBricks = newBricks.toSpliced(brickIndex, 1, brick.devolve())
        } else {
          newBricks = newBricks.toSpliced(brickIndex, 1)
        }
      }

      movementRemaining -= intDist
      newBall = int.calculateBallReflection()
    }
  }

  const result: Partial<IGameState> = { ball: newBall }

  if (newScore !== score) {
    result.score = newScore
  }

  if (newBricks !== bricks) {
    result.bricks = newBricks

    if (newBricks.length === 0) {
      result.phase = 'completed'
    }
  }

  return result
}
