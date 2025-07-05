import { type IFleeingButtonState } from './types.ts'
import { AARect, Vec2D } from '../../common/math/geom2d.ts'

export const STAGE = new AARect({
  width: 3,
  height: 2,
  x: 0,
  y: 0,
})

export const DEFAULT_MOVEMENT_DISTANCE = 0.025
export const MAXIMUM_BUTTON_SPEEDUP = 3
export const MOUSE_DISTANCE_THRESHOLD = 0.6
export const ATTRACTOR_EDGE_OFFSET = 0.25
export const ATTRACTOR_INNER_OFFSET = 0.5
export const ATTRACTOR_SAFETY_DISTANCE = DEFAULT_MOVEMENT_DISTANCE
export const DEFAULT_STATE: Omit<IFleeingButtonState, 'mousePosition' | 'activeAttractor' | 'debug'> = {
  buttonPosition: STAGE.getCenter(),
}

export const BUTTON_SIZE = new Vec2D({ x: 0.3, y: 0.15 })
