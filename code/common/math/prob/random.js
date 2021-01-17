/**
 * @param {Num.Int32} a
 * @param {Num.Int32} b
 */
export function randInt(a, b) {
  return a + Math.floor(Math.random() * (b - a + 1))
}
