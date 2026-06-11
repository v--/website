import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { zip } from './zip.ts'

describe('zip function', function () {
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
      ['b', 2],
    ])
  })

  it('zips two non-equinumerous array by stopping at the shorter one\'s size', function () {
    const zipped = zip(['a', 'b', 'c'], [1, 2])
    assert.deepEqual(Array.from(zipped), [
      ['a', 1],
      ['b', 2],
    ])
  })

  it('zips three equinumerous arrays', function () {
    const zipped = zip(['a', 'b', 'c'], ['а', 'б', 'в'], [1, 2, 3])
    assert.deepEqual(Array.from(zipped), [
      ['a', 'а', 1],
      ['b', 'б', 2],
      ['c', 'в', 3],
    ])
  })
})
