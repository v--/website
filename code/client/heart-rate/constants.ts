import { AARect } from '../../common/math/geom2d.ts'

export const MIN_TARGET_HEART_RATE = 30
export const MAX_TARGET_HEART_RATE = 160
export const DEFAULT_HEART_RATE = 60
export const DEFAULT_HEART_RATE_DELTA = 15

export const MIN_WINDOW_SIZE = 5
export const MAX_WINDOW_SIZE = 20
export const DEFAULT_WINDOW_SIZE = 10

export const SIMULATION_BOUNDS = new AARect({
  x: 0,
  y: -0.6,
  width: 4,
  height: 1,
})
