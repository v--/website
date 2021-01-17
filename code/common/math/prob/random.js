/**
 * @param {int32} a
 * @param {int32} b
 */
export function randInt(a, b) {
  return a + Math.floor(Math.random() * (b - a + 1))
}
