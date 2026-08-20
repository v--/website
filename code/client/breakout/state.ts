import { BreakoutPaddle } from './geom/paddle.ts'
import { computeBreakoutTrajectory } from './geom/trajectory.ts'
import { type IBrickState, type IControllableGameState, type IInternalGameState } from './types.ts'
import { Vec2D } from '../../common/math/geom2d.ts'
import { DEFAULT_FRAME_DURATION } from '../core/dom.ts'

const DEFAULT_PADDLE = new BreakoutPaddle({ center: 0.0 })
const DEFAULT_BALL_SOURCE = new Vec2D({ x: 0.0, y: 3.5 })
const DEFAULT_BALL_TARGET = DEFAULT_PADDLE.intersectWithBall(DEFAULT_BALL_SOURCE, { x: 0.0, y: 1.0 })!

const DEFAULT_BRICK_STATE: IBrickState[] = [
  { power: 1, x: -7, y: 2 },
  { power: 1, x: 6, y: 2 },
]

export const DEFAULT_INTERNAL_GAME_STATE: IInternalGameState = {
  frameDuration: DEFAULT_FRAME_DURATION,
  score: 0,
  paddleCenter: DEFAULT_PADDLE.center,
  ballPosition: 0.0,
  ballSource: DEFAULT_BALL_SOURCE,
  ballTarget: DEFAULT_BALL_TARGET,
  trajectory: computeBreakoutTrajectory(DEFAULT_BALL_SOURCE, DEFAULT_BALL_TARGET, DEFAULT_PADDLE.center, DEFAULT_BRICK_STATE),
  bricks: DEFAULT_BRICK_STATE,
}

export const DEFAULT_CONTROLLABLE_GAME_STATE: IControllableGameState = {
  paddleDirection: 0,
  phase: 'unstarted',
  debug: false,
  virtualControls: false,
}
