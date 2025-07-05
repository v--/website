import { type IIntersection, Vec2D } from '../../../common/math/geom2d.ts'
import { isClose, isLeq } from '../../../common/support/floating.ts'
import { schwartzMin } from '../../../common/support/iteration.ts'
import { type float64 } from '../../../common/types/numbers.ts'
import { BreakoutBrick } from '../brick.ts'
import { BALL_CONTROL_POINT_ANGLES, BALL_MOVEMENT_PER_SECOND, BALL_RADIUS, STAGE } from '../constants.ts'
import { findClosestIntersection, reflectDirectionThroughIntersection } from '../intersection.ts'
import { type IGameState } from '../types.ts'

export function evolveBall(state: IGameState): Partial<IGameState> {
  const { paddleCenter, ballCenter, ballDirection, bricks, score, fps } = state
  const ballMovement = BALL_MOVEMENT_PER_SECOND / fps

  let movementRemaining = ballMovement
  let newBallCenter = ballCenter
  let newBallDirection = ballDirection
  let newBricks = bricks
  let newScore = score

  while (true) {
    const closestBallIntersection = schwartzMin(
      ({ intDist }) => intDist,
      iterBallIntersections(newBallCenter, newBallDirection, paddleCenter, newBricks),
    )

    // If an intersection calculation goes wrong, we end the game.
    // This occasionally happens in the bottom, when the ball starts reflecting off the paddle and walls at odd angles.
    // If it happens in other circumstances, the "Game Over" message would be wrong, but may be better than an unhandled error.
    if (closestBallIntersection === undefined) {
      return {
        phase: 'game_over',
        ballCenter: newBallCenter,
        ballDirection: newBallDirection,
      }
    }

    const { ballPoint, int, intDist } = closestBallIntersection

    if (isLeq(movementRemaining, intDist)) {
      newBallCenter = newBallCenter.translate(newBallDirection, movementRemaining)
      break
    } else {
      if (isClose(int.point.y, STAGE.getBottomPos())) {
        newBallCenter = newBallCenter.translate(newBallDirection, intDist)

        return {
          phase: 'game_over',
          ballCenter: newBallCenter,
          ballDirection: newBallDirection,
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
      newBallDirection = reflectDirectionThroughIntersection(ballPoint, newBallDirection, int)
      newBallCenter = newBallCenter.translate(newBallDirection, intDist)
    }
  }

  const result: Partial<IGameState> = { ballCenter: newBallCenter }

  if (newScore !== score) {
    result.score = newScore
  }

  if (newBricks !== bricks) {
    result.bricks = newBricks

    if (newBricks.length === 0) {
      result.phase = 'completed'
    }
  }

  if (newBallDirection !== ballDirection) {
    result.ballDirection = newBallDirection
  }

  return result
}

interface IBallIntersection {
  ballPoint: Vec2D
  int: IIntersection
  intDist: float64
}

function* iterBallIntersections(
  ballCenter: Vec2D,
  ballDirection: Vec2D,
  paddleCenter: float64,
  bricks: BreakoutBrick[],
): Generator<IBallIntersection> {
  for (const angle of BALL_CONTROL_POINT_ANGLES) {
    const ballPoint = ballCenter.translate(ballDirection.rotate(angle), BALL_RADIUS)

    const int = findClosestIntersection(ballPoint, ballDirection, paddleCenter, bricks)

    if (int) {
      const intDist = ballPoint.distanceTo(int.point)
      yield { ballPoint, int, intDist }
    }
  }
}
