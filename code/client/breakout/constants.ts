import { BreakoutBrick } from './brick.ts'
import { type IGameState } from './types.ts'
import { AARect, Vec2D } from '../../common/math/geom2d.ts'

export const KEY_CONTROL = 's'
export const KEY_RESET = 'r'
export const KEY_DEBUG = 'e'
export const KEY_LEFT_SECONDARY = 'a'
export const KEY_RIGHT_SECONDARY = 'd'

export const BALL_CONTROL_POINT_ANGLES = [
  -Math.PI / 2,
  -Math.PI / 6,
  0,
  Math.PI / 6,
  Math.PI / 2,
]

export const FPS_INDICATOR_REFRESHES_PER_SECOND = 2 // This is only for the visual indicator
// The movement speed is determined by the FPS and the intended amount traversed per second
export const BALL_MOVEMENT_PER_SECOND = 15
export const PADDLE_MOVEMENT_PER_SECOND = 20

export const EVOLUTION_FREQUENCY = 2
export const BRICK_EVOLUTION_BALL_MIN_DISTANCE = 4
export const BRICK_EVOLUTION_BOTTOM_MIN_DISTANCE = 4
export const BRICK_MAX_POWER = 3

// All sizes are part of the following grid:
export const STAGE = new AARect({
  width: 18,
  height: 12,
  x: -9,
  y: 0,
})

// Sizes can, of course, be fractional
export const BALL_RADIUS = 0.3
export const PADDLE_WIDTH = 2
export const PADDLE_HEIGHT = 0.3

export const DEFAULT_GAME_STATE: Omit<IGameState, 'fps' | 'debug'> = {
  phase: 'unstarted',
  paddleCenter: 0,
  paddleDirection: 0,
  score: 0,
  ballCenter: new Vec2D({ x: 0, y: 3.5 }),
  ballDirection: new Vec2D({ x: 0, y: 1 }),
  bricks: [
    new BreakoutBrick({ power: 1, x: -7, y: 2 }),
    new BreakoutBrick({ power: 1, x: 6, y: 2 }),
  ],
}
