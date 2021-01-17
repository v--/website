const EPSILON = 1e-10

/**
 * @param {float64} a
 * @param {float64} b
 * @returns {boolean}
 */
export function isSameNumber(a, b) {
  return Math.abs(a - b) < EPSILON
}

/**
 * @param {float64} a
 * @param {float64} b
 * @returns {boolean}
 */
export function isGreaterThan(a, b) {
  return a >= b - EPSILON
}

/**
 * @param {float64} x
 * @returns {float64}
 */
export function roundNumber(x) {
  return Math.round(x / EPSILON) * EPSILON
}
