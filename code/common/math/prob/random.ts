import { int32 } from '../../types/numeric'

export function randInt(a: int32, b: int32) {
  return a + Math.floor(Math.random() * (b - a + 1))
}
