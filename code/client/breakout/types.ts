import { type IPlainVec2D, Vec2D } from '../../common/math/geom2d.ts'
import { type UnitRatio, type float64, type uint32 } from '../../common/types/numbers.ts'
import { type Action } from '../../common/types/typecons.ts'

export type PaddleDirection = -1 | 0 | 1

export type GamePhase =
  'unstarted' |
  'running' |
  'paused' |
  'completed' |
  'game-over'

export type GameBrickPower = 1 | 2 | 3

export interface IBallState {
  ballSource: IPlainVec2D
  ballTarget: IBreakoutIntersection
  ballPosition: UnitRatio
}

export interface IBrickState {
  x: uint32
  y: uint32
  power: GameBrickPower
}

export interface IBreakoutIntersectionB {
  x: uint32
  y: uint32
  power: GameBrickPower
}

export interface IBreakoutIntersection {
  newCenter: IPlainVec2D
  reflectedDirection: IPlainVec2D
  brick?: IBrickState
  isLastHit?: boolean
  isStageBottom?: boolean
}

export interface IBreakoutTrajectory {
  head: IPlainVec2D
  tail: IBreakoutIntersection[]
}

export interface IInternalGameState extends IBallState {
  paddleCenter: float64
  score: uint32
  bricks: IBrickState[]
  frameDuration: float64
  trajectory: IBreakoutTrajectory
}

export interface IControllableGameState {
  phase: GamePhase
  paddleDirection: PaddleDirection
  virtualControls: boolean
  debug: boolean
}

export interface IComputedGameState {
  ballCenter: Vec2D
  ballDirection: Vec2D
}

export type UpdateGameState = Action<Partial<IControllableGameState>>
