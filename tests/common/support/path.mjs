/* globals describe it */

import { expect } from '../../../code/tests'

import Path from '../../../code/common/support/path'

describe('Path()', function () {
  it('preserves the raw string form', function () {
    const path = new Path('/')
    expect(String(path)).to.equal('/')
  })

  describe('segments', function () {
    it('splits a correct URL into segments', function () {
      const path = new Path('/lorem/ipsum')
      expect(path.segments).to.deep.equal(['lorem', 'ipsum'])
    })

    it('handles endling slashes', function () {
      const path = new Path('/lorem/ipsum/')
      expect(path.segments).to.deep.equal(['lorem', 'ipsum'])
    })

    it('handles double slashes', function () {
      const path = new Path('/lorem//ipsum')
      expect(path.segments).to.deep.equal(['lorem', 'ipsum'])
    })

    it('handles relative URLs', function () {
      const path = new Path('lorem/ipsum')
      expect(path.segments).to.deep.equal(['lorem', 'ipsum'])
    })
  })

  describe('query', function () {
    it('handles a single parameter', function () {
      const path = new Path('/url?lorem=ipsum')
      expect(path.query).to.deep.equal(new Map([['lorem', 'ipsum']]))
    })

    it('handles multiple parameters', function () {
      const path = new Path('/url?lorem=ipsum&dolor=sit')
      expect(path.query).to.deep.equal(new Map([['lorem', 'ipsum'], ['dolor', 'sit']]))
    })
  })
})
