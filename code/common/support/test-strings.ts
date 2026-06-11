import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { dedent } from './dedent.ts'
import { repr } from './strings.ts'

describe('repr function', function () {
  it('works for strings', function () {
    assert.equal(repr('string'), '\'string\'')
  })

  it('escapes quotes in strings', function () {
    assert.equal(repr("str'ing"), "'str\\'ing'")
  })

  it('allows configuring the escapable quotes in strings', function () {
    assert.equal(repr('str"ing', { quoteType: 'double' }), '"str\\"ing"')
  })

  it('works for numbers', function () {
    assert.equal(repr(666), '666')
  })

  it('works for booleans', function () {
    assert.equal(repr(true), 'true')
  })

  it('works for null', function () {
    assert.equal(repr(null), 'null')
  })

  it('works for undefined', function () {
    assert.equal(repr(undefined), 'undefined')
  })

  it('works for functions', function () {
    function frobnicate() {
    }
    assert.equal(repr(frobnicate), 'frobnicate')
  })

  it('works for anonymous functions', function () {
    assert.equal(repr(function () {
    }), 'anonymous')
  })

  it('works for arrays', function () {
    assert.equal(repr([0, 1, 2]), '[0, 1, 2]')
  })

  it('escapes quotes in strings within arrays', function () {
    assert.equal(repr(['str\'ing']), '[\'str\\\'ing\']')
  })

  it('works for flat objects', function () {
    assert.equal(repr({ a: 1, b: false }), '{ a: 1, b: false }')
  })

  it('works for flat objects with indentation', function () {
    const object = { a: 1, b: false }
    const expected = dedent(`\
      {
        a: 1,
        b: false
      }`,
    )

    assert.equal(repr(object, { indent: true }), expected)
  })

  it('works for nested objects with spacing', function () {
    const object = { a: 1, b: { c: false } }
    const expected = dedent(`\
      {
        a: 1,
        b: {
          c: false
        }
      }`,
    )

    assert.equal(repr(object, { indent: true }), expected)
  })

  it('works for nested arrays with spacing', function () {
    const object = [1, [2, [3, []]]]
    const expected = dedent(`\
      [
        1,
        [
          2,
          [
            3,
            []
          ]
        ]
      ]`,
    )

    assert.equal(repr(object, { indent: true }), expected)
  })

  it('works for custom class instances with no own toString method', function () {
    class Custom<T> {
      arg: T

      constructor(arg: T) {
        this.arg = arg
      }
    }

    assert.equal(repr(new Custom(13)), 'Custom { arg: 13 }')
  })

  it('works for custom class instances with own toString method', function () {
    class Custom<T> {
      arg: T

      constructor(arg: T) {
        this.arg = arg
      }

      toString() {
        return `Custom<${repr(this.arg)}>`
      }
    }

    assert.equal(repr(new Custom(13)), 'Custom<13>')
  })

  it('allows evaluating simple serialized objects', function () {
    const object = { a: 1, b: false, c: null }
    // eslint-disable-next-line no-eval
    assert.deepEqual(eval('(' + repr(object) + ')'), object)
  })
})
