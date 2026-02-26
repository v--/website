import { type IPlainVec2D, type Vec2D } from './vec2d.ts'

export interface IIntersection {
  point: Vec2D
  calculateReflectedDirection: () => Vec2D
}

export interface IIntersectible {
  intersectWithRay(origin: Vec2D, direction: IPlainVec2D): IIntersection | undefined
}
