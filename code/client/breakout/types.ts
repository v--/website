import { type BreakoutBrick } from './brick.ts'
import { type BreakoutBall } from './geom/ball.ts'
import { type BreakoutPaddle } from './geom/paddle.ts'
import { Vec2D } from '../../common/math/geom2d.ts'
import { type uint32 } from '../../common/types/numbers.ts'
import { type Action } from '../../common/types/typecons.ts'

export type PaddleDirection = -1 | 0 | 1

export type GamePhase =
  'unstarted' |
  'running' |
  'paused' |
  'completed' |
  'game_over'

export type GameBrickPower = 1 | 2 | 3

export interface IGameState {
  phase: GamePhase
  fps: uint32
  debug: boolean
  paddle: BreakoutPaddle
  score: uint32
  ball: BreakoutBall
  bricks: BreakoutBrick[]
}

export interface IBreakoutIntersection {
  newCenter: Vec2D
  figure: unknown
  calculateBallReflection(): BreakoutBall
}

export interface IBreakoutIntersectible {
  intersectWithBall(origin: BreakoutBall): IBreakoutIntersection | undefined
}

export type UpdateGameState = Action<Partial<IGameState>>
