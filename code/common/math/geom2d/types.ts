import { type Line2D } from './line2d.ts'
import { type Vec2D } from './vec2d.ts'

export interface IIntersection {
  figure: IIntersectible
  tangent: Line2D
  point: Vec2D
}

export interface IIntersectible {
  intersectWithRay(origin: Vec2D, direction: Vec2D): IIntersection | undefined
}
