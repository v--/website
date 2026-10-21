import { AARect } from '../../common/math/geom2d.ts'

export const CYCLE_COUNT = 5
export const SIMULATION_BOUNDS = new AARect({
  x: 0,
  y: -0.5,
  width: CYCLE_COUNT - 1,
  height: 0.8,
})
