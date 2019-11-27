import { describe, it, assert } from '../../../_common.js'

import { iterPermutations } from '../../../../code/common/math/combin/perm.js'

describe('iterPermutations()', function () {
  it('iterates the single permutation of zero', function () {
    const perms = Array.from(iterPermutations(0))
    assert.deepEqual(perms, [
      [0]
    ])
  })

  it('iterates all two-element permutations', function () {
    const perms = Array.from(iterPermutations(1))
    assert.deepEqual(perms, [
      [0, 1],
      [1, 0]
    ])
  })

  it('iterates all three-element permutation', function () {
    const perms = Array.from(iterPermutations(2))
    assert.deepEqual(perms, [
      [0, 1, 2],
      [0, 2, 1],
      [2, 0, 1],
      [1, 0, 2],
      [1, 2, 0],
      [2, 1, 0]
    ])
  })
})
