import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { Path } from './path.ts'
import { assertFalse, assertTrue } from '../../testing/assertion.ts'

describe('Path clas', function () {
  describe('segments property', function () {
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
      assert.deepEqual(path.prefixSlash, false)
    })
  })

  describe('matchPrefix method', function () {
    it('matches a path to the empty prefix', function () {
      const path = Path.parse('/a/b/c')
      assertTrue(path.matchPrefix())
    })

    it('matches a path to itself', function () {
      const path = Path.parse('/a/b/c')
      assertTrue(path.matchPrefix('a', 'b', 'c'))
    })

    it('matches a path to its prefix', function () {
      const path = Path.parse('/a/b/c')
      assertTrue(path.matchPrefix('a', 'b'))
    })

    it('does not match a mistaken prefix', function () {
      const path = Path.parse('/a/b/c')
      assertFalse(path.matchPrefix('a', 'c'))
    })

    it('does not match a path shorted than the prefix', function () {
      const path = Path.parse('/a/b/c')
      assertFalse(path.matchPrefix('a', 'b', 'c', 'd'))
    })
  })
})
