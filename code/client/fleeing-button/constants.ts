import { type IFleeingButtonState } from './types.ts'
import { AARect, Vec2D } from '../../common/math/geom2d.ts'

export const STAGE = new AARect({
  width: 3,
  height: 2,
  x: -1.5,
  y: -1,
})

export const DEFAULT_MOVEMENT_DISTANCE = 0.025
export const MAXIMUM_BUTTON_SPEEDUP = 3
export const MOUSE_DISTANCE_THRESHOLD = 0.6
export const ATTRACTOR_RING_POINTS = 16
export const ATTRACTOR_MAJOR_AXIS = 1
export const ATTRACTOR_MINOR_AXIS = 0.6
export const ATTRACTOR_SAFETY_DISTANCE = DEFAULT_MOVEMENT_DISTANCE
export const DEFAULT_STATE: Omit<IFleeingButtonState, 'mousePosition' | 'activeAttractor' | 'debug'> = {
  buttonPosition: STAGE.getCenter(),
}

export const BUTTON_SIZE = new Vec2D({ x: 0.3, y: 0.15 })
