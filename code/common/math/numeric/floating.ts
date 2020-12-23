const EPSILON = 1e-10

export function isSameNumber(a: number, b: number): boolean {
  return Math.abs(a - b) < EPSILON
}

export function isGreaterThan(a: number, b: number): boolean {
  return a >= b - EPSILON
}

export function roundNumber(x: number): number {
  return Math.round(x / EPSILON) * EPSILON
}
