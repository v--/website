import { type Vec2D } from '../../common/math/geom2d.ts'
import { type uint32 } from '../../common/types/numbers.ts'

export interface IAttractor {
  position: Vec2D
  power: uint32
}

export interface IFleeingButtonState {
  debug: boolean
  buttonPosition: Vec2D
  mousePosition: Vec2D | undefined
  activeAttractor: Vec2D | undefined
}
