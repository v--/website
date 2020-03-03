import { describe, it, assert } from '../../_common.js'

import { orderComparator } from '../../../code/common/support/sorting.js'

describe('orderComparator()', function () {
  it('compares single-digit positive numbers correctly', function () {
    assert.equal(orderComparator(1, 3), -1)
  })

  it('compares single-digit mixed numbers correctly', function () {
    assert.equal(orderComparator(1, -1), 1)
  })

  it('compares numbers with a different number of digits correctly', function () {
    assert.equal(orderComparator(2, 10), -1)
  })
})
