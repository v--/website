export const GAME_SIZE = { x: 20, y: 15 }
export const PADDLE_SIZE = { x: 2, y: 0.5 }
export const BALL_RADIUS = 0.3
export const MOVEMENT_PERIOD = 10
export const EVOLUTION_PERIOD = 2000
export const MOVEMENT_DELTA = MOVEMENT_PERIOD / 60
export const MAX_BRICK_POWER = 3

export const EPSILON = 1e-3

export const DEFAULT_GAME_STATE = {
  score: 0,
  paddleX: 0,
  paddleDirection: 0,
  ball: Object.freeze({ x: 0, y: GAME_SIZE.y / 3 }),
  ballDirection: { x: 0, y: 1 },
  bricks: [
    { x: -GAME_SIZE.x / 2 + 4, y: 3, power: 1 },
    { x: GAME_SIZE.x / 2 - 4, y: 3, power: 1 }
  ]
}
