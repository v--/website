import { assert } from '../../_common.js'

import { EmptyIterError, reduce, range, zip, sort, shuffle, product, empty } from '../../../code/common/support/iteration.js'

describe('zip()', function () {
  it('zips nothing', function () {
    const zipped = zip()
    assert.deepEqual(Array.from(zipped), [])
  })

  it('zips single array', function () {
    const zipped = zip(['a', 'b'])
    assert.deepEqual(Array.from(zipped), [['a'], ['b']])
  })

  it('zips two equinumerous array', function () {
    const zipped = zip(['a', 'b'], [1, 2])
    assert.deepEqual(Array.from(zipped), [
      ['a', 1],
      ['b', 2]
    ])
  })

  it("zips two non-equinumerous array by stopping at the shorter one's size", function () {
    const zipped = zip(['a', 'b', 'c'], [1, 2])
    assert.deepEqual(Array.from(zipped), [
      ['a', 1],
      ['b', 2]
    ])
  })

  it('zips three equinumerous arrays', function () {
    const zipped = zip(['a', 'b', 'c'], ['а', 'б', 'в'], [1, 2, 3])
    assert.deepEqual(Array.from(zipped), [
      ['a', 'а', 1],
      ['b', 'б', 2],
      ['c', 'в', 3]
    ])
  })
})

describe('reduce()', function () {
  it('throws when trying to reduce nothing', function () {
    assert.throws(reduce.bind(null, Boolean, []), EmptyIterError)
  })

  it("doesn't throw when trying to reduce nothing with a default value", function () {
    assert.doesNotThrow(reduce.bind(null, Boolean, [], 'default'), EmptyIterError)
  })

  it('correctly sums an array of values', function () {
    assert.equal(reduce((a, b) => a + b, range(5), 0), 10)
  })
})

describe('shuffle()', function () {
  it('shuffles an iterator', function () {
    const shuffled = shuffle(range(1, 6))
    assert.deepEqual(sort(shuffled), [1, 2, 3, 4, 5])
  })

  it('does not mutate the original array', function () {
    const array = Array.from(range(0, 100))
    const copy = Array.from(array)
    assert.deepEqual(copy, array)
  })
})

describe('product()', function () {
  it('multiplies zero iterables', function () {
    const prod = product()
    assert.deepEqual(Array.from(prod), [])
  })

  it('produces empty iterables when fed at least one empty iterable', function () {
    const prod = product(range(1, 10), empty())
    assert.deepEqual(Array.from(prod), [])
  })

  it('produces a cartessian product of one iterable', function () {
    const prod = product(range(1, 4))
    assert.deepEqual(Array.from(prod), [[1], [2], [3]])
  })

  it('produces a cartessian product of two iterables', function () {
    const prod = product(range(1, 3), range(1, 3))
    assert.deepEqual(Array.from(prod), [[1, 1], [1, 2], [2, 1], [2, 2]])
  })
})
