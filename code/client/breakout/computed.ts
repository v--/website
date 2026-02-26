import { BreakoutBrick } from './geom/brick.ts'
import { findClosestIntersection, isIntersectionFatal } from './geom/intersection.ts'
import { type IBallState, type IBreakoutIntersection, type IComputedGameState, type IGameState, type IIncompleteGameState } from './types.ts'
import { isClose, isZero } from '../../common/support/floating.ts'

export function getComputedState(state: IBallState): IComputedGameState {
  const diffVector = state.ballTarget.newCenter.sub(state.ballSource)
  const diff = diffVector.getNorm()
  const ballDirection = diffVector.scaleToNormed()
  const ballCenter = state.ballSource.translate(ballDirection, state.ballPosition * diff)

  return { ballCenter, ballDirection }
}

export function refreshTarget(state: IIncompleteGameState): Partial<IGameState> | undefined {
  const { paddle, ballTarget, bricks } = state
  const { ballCenter, ballDirection } = getComputedState(state)

  const int = findClosestIntersection(ballCenter, ballDirection, paddle, bricks)

  if (int === undefined || isZero(int.newCenter.distanceTo(ballTarget.newCenter))) {
    return undefined
  }

  return {
    ballPosition: 0.0,
    ballSource: ballCenter,
    ballTarget: int,
  }
}

function processBrickCollisions(state: IIncompleteGameState, int: IBreakoutIntersection): Partial<IGameState> | undefined {
  if (int.figure instanceof BreakoutBrick) {
    const newBricks = state.bricks.slice()
    const brick = int.figure
    const brickIndex = newBricks.indexOf(brick)

    if (brick.power > 1) {
      newBricks.splice(brickIndex, 1, brick.devolve())
    } else {
      newBricks.splice(brickIndex, 1)
    }

    return {
      bricks: newBricks,
      score: state.score + 1,
      phase: newBricks.length === 0 ? 'completed' : state.phase,
    }
  }

  return undefined
}

export function processCollisions(state: IIncompleteGameState): Partial<IGameState> | undefined {
  const { ballPosition, ballTarget, paddle, bricks } = state

  if (!isClose(ballPosition, 1.0)) {
    return undefined
  }

  if (isIntersectionFatal(ballTarget)) {
    return {
      phase: 'game_over',
    }
  }

  const refl = ballTarget.calculateReflectedDirection()
  const reflInt = findClosestIntersection(ballTarget.newCenter, refl, paddle, bricks)

  if (reflInt === undefined) {
    return undefined
  }

  return {
    ballPosition: 0.0,
    ballSource: ballTarget.newCenter,
    ballTarget: reflInt,
    ...processBrickCollisions(state, ballTarget),
  }
}
