import { describe, it, assert } from '../../_common.js'

import { Path } from '../../../code/common/support/path.js'

describe('Path', function () {
  describe('segments', function () {
    it('splits a correct URL into segments', function () {
      const path = Path.parse('/lorem/ipsum')
      assert.deepEqual(path.segments, ['lorem', 'ipsum'])
    })

    it('handles endling slashes', function () {
      const path = Path.parse('/lorem/ipsum/')
      assert.deepEqual(path.segments, ['lorem', 'ipsum'])
    })

    it('handles double slashes', function () {
      const path = Path.parse('/lorem//ipsum')
      assert.deepEqual(path.segments, ['lorem', 'ipsum'])
    })

    it('handles relative URLs', function () {
      const path = Path.parse('lorem/ipsum')
      assert.deepEqual(path.segments, ['lorem', 'ipsum'])
    })
  })

  describe('query', function () {
    it('strips the query string from the source URL', function () {
      const path = Path.parse('/url?lorem=ipsum')
      assert.deepEqual(path.segments, ['url'])
    })

    it('handles a single parameter', function () {
      const path = Path.parse('/url?lorem=ipsum')
      assert.deepEqual(path.query, new Map([['lorem', 'ipsum']]))
    })

    it('handles multiple parameters', function () {
      const path = Path.parse('/url?lorem=ipsum&dolor=sit')
      assert.deepEqual(path.query, new Map([['lorem', 'ipsum'], ['dolor', 'sit']]))
    })
  })

  describe('cooked', function () {
    it('outputs the raw URL if it is nicely formed', function () {
      const path = Path.parse('/url?lorem=ipsum')
      assert.equal(path.cooked, '/url?lorem=ipsum')
    })
  })
})
