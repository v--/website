import { type BreakoutBrick } from './geom/brick.ts'
import { type BreakoutPaddle } from './geom/paddle.ts'
import { type IPlainVec2D, Vec2D } from '../../common/math/geom2d.ts'
import { type UnitRatio, type uint32 } from '../../common/types/numbers.ts'
import { type Action } from '../../common/types/typecons.ts'

export type PaddleDirection = -1 | 0 | 1

export type GamePhase =
  'unstarted' |
  'running' |
  'paused' |
  'completed' |
  'game_over'

export type GameBrickPower = 1 | 2 | 3

export interface IBreakoutIntersection {
  newCenter: Vec2D
  figure: unknown
  calculateReflectedDirection(): Vec2D
}

export interface IBreakoutIntersectible {
  intersectWithBall(ballSource: Vec2D, ballTarget: IPlainVec2D): IBreakoutIntersection | undefined
}

export interface IBallState {
  ballSource: Vec2D
  ballTarget: IBreakoutIntersection
  ballPosition: UnitRatio
}

export interface IIncompleteGameState extends IBallState {
  phase: GamePhase
  paddle: BreakoutPaddle
  score: uint32
  bricks: BreakoutBrick[]
}

export interface IGameState extends IIncompleteGameState {
  virtualControls: boolean
  debug: boolean
  fps: uint32
}

export interface IComputedGameState {
  ballCenter: Vec2D
  ballDirection: Vec2D
}

export type UpdateGameState = Action<Partial<IGameState>>
