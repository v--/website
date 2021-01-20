import { shuffle } from '../../support/iteration.js'

export function * iterPermutations(n: TNum.UInt32): Generator<TNum.UInt32[]> {
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

export function randomPermutation(n: TNum.UInt32) {
  const result = []

  for (let i = 0; i < n; i++) {
    result[i] = i
  }

  return shuffle(result)
}
