/**
 * @param {TNum.Int32} a
 * @param {TNum.Int32} b
 */
export function randInt(a, b) {
  return a + Math.floor(Math.random() * (b - a + 1))
}
