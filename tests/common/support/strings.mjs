/* globals describe it */

import { expect } from '../../../code/tests'

import { repr } from '../../../code/common/support/strings'

describe('repr()', function () {
  it('works for strings', function () {
    expect(repr('string')).to.equal("'string'")
  })

  it('works for numbers', function () {
    expect(repr(666)).to.equal('666')
  })

  it('works for booleans', function () {
    expect(repr(true)).to.equal('true')
  })

  it('works for null', function () {
    expect(repr(null)).to.equal('null')
  })

  it('works for undefined', function () {
    expect(repr(undefined)).to.equal('undefined')
  })

  it('works for functions', function () {
    function frobnicate () {}
    expect(repr(frobnicate)).to.equal('frobnicate')
  })

  it('works for anonymous functions', function () {
    expect(repr(function () {})).to.equal('anonymous')
  })

  it('works for arrays', function () {
    expect(repr([0, 1, 2])).to.equal('[0, 1, 2]')
  })

  it('works for flat objects', function () {
    expect(repr({ a: 1, b: false })).to.equal('{ a: 1, b: false }')
  })

  it('works for custom class instances with no own toString method', function () {
    class Custom {
      constructor (arg) {
        this.arg = arg
      }
    }

    expect(repr(new Custom(13))).to.equal('Custom { arg: 13 }')
  })

  it('works for custom class instances with own toString method', function () {
    class Custom {
      constructor (arg) {
        this.arg = arg
      }

      toString () {
        return `Custom<${this.arg}>`
      }
    }

    expect(repr(new Custom(13))).to.equal('Custom<13>')
  })

  it('allows evaluating simple serialized objects', function () {
    const object = { a: 1, b: false, c: null }
    expect(eval('(' + repr(object) + ')')).to.deep.equal(object) // eslint-disable-line no-eval
  })
})
