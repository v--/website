import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { Path } from './path.ts'
import { UrlPath } from './url_path.ts'
import { assertCustomEqual } from '../../testing/assertion.ts'

describe('UrlPath class', function () {
  describe('query field', function () {
    it('strips the query string from the source URL', function () {
      const urlPath = UrlPath.parse('/url?lorem=ipsum')
      assertCustomEqual(urlPath.path, Path.parse('/url'))
    })

    it('handles a single parameter', function () {
      const urlPath = UrlPath.parse('/url?lorem=ipsum')
      assert.deepEqual(urlPath.query, new Map([['lorem', 'ipsum']]))
    })

    it('handles multiple parameters', function () {
      const urlPath = UrlPath.parse('/url?lorem=ipsum&dolor=sit')
      assert.deepEqual(urlPath.query, new Map([['lorem', 'ipsum'], ['dolor', 'sit']]))
    })
  })

  describe('toString method', function () {
    it('outputs the raw URL if it is nicely formed', function () {
      const urlPath = UrlPath.parse('/url?lorem=ipsum')
      assert.equal(urlPath.toString(), '/url?lorem=ipsum')
    })
  })
})
