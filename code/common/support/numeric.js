export const EPSILON = 1e-10

export function isSameNumber (a, b) {
  return Math.abs(a - b) < EPSILON
}

export function roundNumber (x) {
  return Math.round(x / EPSILON) * EPSILON
}
