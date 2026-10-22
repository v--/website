import { type float64, type uint32 } from '../../types/numbers.ts'
import { MathError } from '../errors.ts'
import { type IPlainVec2D } from '../geom2d.ts'

export function randFloat(a: float64, b: float64): float64 {
  return a + Math.random() * (b - a)
}

export function randInt(a: uint32, b: uint32): uint32 {
  return Math.floor(randFloat(a, b))
}

export function randTriangular(a: float64, b: float64, c: float64): float64 {
  const k = (c - a) / (b - a)
  const u = Math.random()

  if (u < k) {
    return a + Math.sqrt(u * (b - a) * (c - a))
  }

  return b - Math.sqrt((1 - u) * (b - a) * (b - c))
}

export function choice<T>(collection: T[]): T {
  if (collection.length === 0) {
    throw new MathError('Cannot choose an element from an empty collection')
  }

  return collection[randInt(0, collection.length)]
}

export function boxMullerTransform({ x, y }: IPlainVec2D): IPlainVec2D {
  const radius = -2 * Math.log(x)
  const angle = 2 * Math.PI * y
  return {
    x: radius * Math.cos(angle),
    y: radius * Math.sin(angle),
  }
}

const randomValues: float64[] = []

export function randNormal(mean: float64 = 0.0, sd: float64 = 1.0): float64 {
  const rv = randomValues.pop()

  if (rv === undefined) {
    const bm = boxMullerTransform({ x: Math.random(), y: Math.random() })
    randomValues.push(bm.y)
    return mean + bm.x * sd
  }

  return mean + rv * sd
}
