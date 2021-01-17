import { describe, it, assert } from '../../_common.js'

import { repr } from '../../../code/common/support/strings.js'

describe('repr()', function() {
  it('works for strings', function() {
    assert.equal(repr('string'), "'string'")
  })

  it('works for numbers', function() {
    assert.equal(repr(666), '666')
  })

  it('works for booleans', function() {
    assert.equal(repr(true), 'true')
  })

  it('works for null', function() {
    assert.equal(repr(null), 'null')
  })

  it('works for undefined', function() {
    assert.equal(repr(undefined), 'undefined')
  })

  it('works for functions', function() {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    function frobnicate() {}
    assert.equal(repr(frobnicate), 'frobnicate')
  })

  it('works for anonymous functions', function() {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    assert.equal(repr(function() {}), 'anonymous')
  })

  it('works for arrays', function() {
    assert.equal(repr([0, 1, 2]), '[0, 1, 2]')
  })

  it('works for flat objects', function() {
    assert.equal(repr({ a: 1, b: false }), '{ a: 1, b: false }')
  })

  it('works for custom class instances with no own toString method', function() {
    class Custom {
      /**
       * @param {unknown} arg
       */
      constructor(arg) {
        this.arg = arg
      }
    }

    assert.equal(repr(new Custom(13)), 'Custom { arg: 13 }')
  })

  it('works for custom class instances with own toString method', function() {
    class Custom {
      /**
       * @param {unknown} arg
       */
      constructor(arg) {
        this.arg = arg
      }

      toString() {
        return `Custom<${this.arg}>`
      }
    }

    assert.equal(repr(new Custom(13)), 'Custom<13>')
  })

  it('allows evaluating simple serialized objects', function() {
    const object = { a: 1, b: false, c: null }
    assert.deepEqual(eval('(' + repr(object) + ')'), object) // eslint-disable-line no-eval
  })
})
