import { findClosestBreakoutIntersection } from './geom/intersection.ts'
import { type GameBrickPower, type IBallState, type IBreakoutIntersection, type IComputedGameState, type IInternalGameState } from './types.ts'
import { Vec2D } from '../../common/math/geom2d.ts'
import { isClose, isZero } from '../../common/support/floating.ts'

export function getComputedState(state: IBallState): IComputedGameState {
  const source = new Vec2D(state.ballSource)
  const target = new Vec2D(state.ballTarget.newCenter)

  const diffVector = target.sub(source)
  const diff = diffVector.getNorm()
  const ballDirection = diffVector.scaleToNormed()
  const ballCenter = source.translate(ballDirection, state.ballPosition * diff)

  return { ballCenter, ballDirection }
}

export function refreshTarget(state: IInternalGameState): Partial<IInternalGameState> | undefined {
  const { paddleCenter, ballTarget, bricks } = state
  const { ballCenter, ballDirection } = getComputedState(state)

  const int = findClosestBreakoutIntersection(ballCenter, ballDirection, paddleCenter, bricks)
  const newCenter = new Vec2D(int.newCenter)

  if (isZero(newCenter.distanceTo(ballTarget.newCenter))) {
    return undefined
  }

  return {
    ballPosition: 0.0,
    ballSource: ballCenter,
    ballTarget: int,
  }
}

function processBrickCollisions(state: IInternalGameState, int: IBreakoutIntersection): Partial<IInternalGameState> | undefined {
  if (int.brick === undefined) {
    return undefined
  }

  const newBricks = state.bricks.slice()
  const brick = int.brick
  const brickIndex = newBricks.findIndex(b => b.x === brick.x && b.y === brick.y)

  if (brick.power > 1) {
    newBricks.splice(brickIndex, 1, { ...brick, power: brick.power - 1 as GameBrickPower })
  } else {
    newBricks.splice(brickIndex, 1)
  }

  return {
    bricks: newBricks,
    score: state.score + 1,
  }
}

export function processCollisions(state: IInternalGameState): Partial<IInternalGameState> | undefined {
  const { ballPosition, ballTarget, paddleCenter, bricks } = state

  if (!isClose(ballPosition, 1.0)) {
    return undefined
  }

  const reflInt = findClosestBreakoutIntersection(
    ballTarget.newCenter,
    ballTarget.reflectedDirection,
    paddleCenter,
    bricks,
  )

  return {
    ballPosition: 0.0,
    ballSource: ballTarget.newCenter,
    ballTarget: reflInt,
    ...processBrickCollisions(state, ballTarget),
  }
}
