import { type float64, type int32, type uint32 } from '../types/numbers.ts'

export const DEFAULT_TOLERANCE = 1e-10 // Number.EPSILON is too small in many cases

export function isClose(a: float64, b: float64, tolerance = DEFAULT_TOLERANCE) {
  return Math.abs(a - b) < tolerance
}

export function isZero(x: float64, tolerance = DEFAULT_TOLERANCE) {
  return Math.abs(x) < tolerance
}

export function isLeq(a: float64, b: float64, tolerance = DEFAULT_TOLERANCE) {
  return a <= b + tolerance
}

export function isLess(a: float64, b: float64, tolerance = DEFAULT_TOLERANCE) {
  return isLeq(a, b, tolerance) && !isClose(a, b)
}

export function isGeq(a: float64, b: float64, tolerance = DEFAULT_TOLERANCE) {
  return a >= b - tolerance
}

export function isGreater(a: float64, b: float64, tolerance = DEFAULT_TOLERANCE) {
  return isGeq(a, b, tolerance) && !isClose(a, b)
}

export function mod(x: uint32, m: uint32): uint32
export function mod(x: int32, m: int32): int32
export function mod(x: float64, m: float64): float64
export function mod(x: float64, m: float64): float64 {
  return ((x % m) + m) % m
}

export function clamp(x: uint32, lower: uint32, upper: uint32): uint32
export function clamp(x: int32, lower: int32, upper: int32): int32
export function clamp(x: float64, lower: float64, upper: float64): float64
export function clamp(x: float64, lower: float64, upper: float64) {
  return Math.min(Math.max(x, lower), upper)
}

/**
 * Stringify an unknown number in a flexible way, with at most `maxDigits` digits.
 * Nonzero numbers that would be rounded to zero use exponential notation (how to represent a small leading polynomial coefficient otherwise?).
 */
export function stringifyNumber(x: float64, maxDigits: uint32 = 3) {
  // We use JavaScript's builtin toFixed method because it handles some special cases that we cannot handle manually
  let s = x.toFixed(maxDigits)

  while (s.endsWith('0')) {
    s = s.slice(0, s.length - 1)
  }

  if (s.endsWith('.')) {
    s = s.slice(0, s.length - 1)
  }

  if (s === '0' && !isClose(x, 0)) {
    return x.toExponential(0)
  }

  return s
}
