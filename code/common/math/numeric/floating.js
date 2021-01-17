const EPSILON = 1e-10

/**
 * @param {Num.Float64} a
 * @param {Num.Float64} b
 * @returns {boolean}
 */
export function isSameNumber(a, b) {
  return Math.abs(a - b) < EPSILON
}

/**
 * @param {Num.Float64} a
 * @param {Num.Float64} b
 * @returns {boolean}
 */
export function isGreaterThan(a, b) {
  return a >= b - EPSILON
}

/**
 * @param {Num.Float64} x
 * @returns {Num.Float64}
 */
export function roundNumber(x) {
  return Math.round(x / EPSILON) * EPSILON
}
