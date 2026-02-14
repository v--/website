import { type Vec2D } from './vec2d.ts'

export interface IIntersection {
  point: Vec2D
  calculateReflection: () => Vec2D
}

export interface IIntersectible {
  intersectWithRay(origin: Vec2D, direction: Vec2D): IIntersection | undefined
}
