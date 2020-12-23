import { shuffle } from '../../support/iteration.js'
import { uint32 } from '../../types/numeric.js'

export function * iterPermutations(n: uint32): Generator<uint32[]> {
  if (n === 0) {
    yield [n]
    return
  }

  for (const perm of iterPermutations(n - 1)) {
    for (let i = n; i >= 0; i--) {
      const newPerm = perm.slice()
      newPerm.splice(i, 0, n)
      yield newPerm
    }
  }
}

export function randomPermutation(n: uint32) {
  const result = []

  for (let i = 0; i < n; i++) {
    result[i] = i
  }

  return shuffle(result)
}
