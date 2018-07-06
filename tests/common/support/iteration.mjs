/* globals describe it */

import { expect } from '../../../code/tests'

import { EmptyIterError, reduce, range, zip, sort, shuffle } from '../../../code/common/support/iteration'

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
