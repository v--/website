import { type BreakoutBrick } from './brick.ts'
import { Vec2D } from '../../common/math/geom2d.ts'
import { type float64, type uint32 } from '../../common/types/numbers.ts'
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
  paddleCenter: float64
  paddleDirection: PaddleDirection
  score: uint32
  ballCenter: Vec2D
  ballDirection: Vec2D
  bricks: BreakoutBrick[]
}

export type UpdateGameState = Action<Partial<IGameState>>
