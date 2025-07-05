import { type Vec2D } from './vec2d.ts'
import { mod } from '../../support/floating.ts'
import { type float64 } from '../../types/numbers.ts'

/**
 * Normalize an angle to [0, 2π)
 */
export function normalizeAngle(angle: float64): float64 {
  return mod(angle, 2 * Math.PI)
}

export function getAngleBetween(a: Vec2D, b: Vec2D) {
  const aAngle = a.getAngle()
  const bAngle = b.getAngle()
  return Math.min(normalizeAngle(aAngle - bAngle), normalizeAngle(bAngle - aAngle))
}
