/* globals describe it */

import { expect } from '../../_common.mjs'

import { EmptyIterError, reduce, range, zip, sort, shuffle, separate, product, empty } from '../../../code/common/support/iteration.mjs'

describe('zip()', function () {
  it('zips nothing', function () {
    const zipped = zip()
    expect(Array.from(zipped)).to.deep.equal([])
  })

  it('zips single array', function () {
    const zipped = zip(['a', 'b'])
    expect(Array.from(zipped)).to.deep.equal([['a'], ['b']])
  })

  it('zips two equinumerous array', function () {
    const zipped = zip(['a', 'b'], [1, 2])
    expect(Array.from(zipped)).to.deep.equal([
      ['a', 1],
      ['b', 2]
    ])
  })

  it("zips two non-equinumerous array by stopping at the shorter one's size", function () {
    const zipped = zip(['a', 'b', 'c'], [1, 2])
    expect(Array.from(zipped)).to.deep.equal([
      ['a', 1],
      ['b', 2]
    ])
  })

  it('zips three equinumerous arrays', function () {
    const zipped = zip(['a', 'b', 'c'], ['а', 'б', 'в'], [1, 2, 3])
    expect(Array.from(zipped)).to.deep.equal([
      ['a', 'а', 1],
      ['b', 'б', 2],
      ['c', 'в', 3]
    ])
  })
})

describe('reduce()', function () {
  it('throws when trying to reduce nothing', function () {
    expect(reduce.bind(null, Boolean, [])).to.throw(EmptyIterError)
  })

  it("doesn't throw when trying to reduce nothing with a default value", function () {
    expect(reduce.bind(null, Boolean, [], 'default')).not.to.throw(EmptyIterError)
  })

  it('correctly sums an array of values', function () {
    expect(reduce((a, b) => a + b, range(5), 0)).to.equal(10)
  })
})

describe('shuffle()', function () {
  it('shuffles an iterator', function () {
    const shuffled = shuffle(range(1, 6))
    expect(sort(shuffled)).to.deep.equal([1, 2, 3, 4, 5])
  })

  it('does not mutate the original array', function () {
    const array = Array.from(range(0, 100))
    const copy = Array.from(array)
    expect(copy).to.deep.equal(array)
  })
})

describe('separate()', function () {
  it('separates array elements', function () {
    const source = [1, 1, 1, 2, 2, 3]
    expect(separate(source)).to.deep.equal([1, 2, 3, 4, 5, 6])
  })

  it('preserves current ordinal structure', function () {
    const source = [1, 11, 5, 7, 3]
    expect(separate(source)).to.deep.equal([1, 5, 3, 4, 2])
  })
})

describe('product()', function () {
  it('multiplies zero iterables', function () {
    const prod = product()
    expect(Array.from(prod)).to.deep.equal([])
  })

  it('produces empty iterables when fed at least one empty iterable', function () {
    const prod = product(range(1, 10), empty())
    expect(Array.from(prod)).to.deep.equal([])
  })

  it('produces a cartessian product of one iterable', function () {
    const prod = product(range(1, 4))
    expect(Array.from(prod)).to.deep.equal([[1], [2], [3]])
  })

  it('produces a cartessian product of two iterables', function () {
    const prod = product(range(1, 3), range(1, 3))
    expect(Array.from(prod)).to.deep.equal([[1, 1], [1, 2], [2, 1], [2, 2]])
  })
})
