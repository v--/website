/* globals describe it */

import { assert } from '../../../_common.mjs'

import { parseConstant, parseFunction } from '../../../../code/client/resolution/parser/terms.mjs'
import TermType from '../../../../code/client/resolution/enums/term_type.mjs'

describe('parseConstant', function () {
  it('handles constants without indices', function () {
    const string = 'a'
    assert.deepEqual(
      parseConstant(string),
      {
        tail: '',
        value: {
          type: TermType.CONSTANT,
          name: 'a'
        }
      }
    )
  })

  it('handles constants with indices', function () {
    const string = 'b2'
    assert.deepEqual(
      parseConstant(string),
      {
        tail: '',
        value: {
          type: TermType.CONSTANT,
          name: 'b2'
        }
      }
    )
  })

  it('handles suffixes correctly', function () {
    const string = 'b2suffix'
    assert.deepEqual(
      parseConstant(string),
      {
        tail: 'suffix',
        value: {
          type: TermType.CONSTANT,
          name: 'b2'
        }
      }
    )
  })

  it('fails on non-constants', function () {
    const string = 'x'
    assert.deepEqual(
      parseConstant(string),
      {
        tail: 'x',
        value: null
      }
    )
  })

  it('fails on gibberish', function () {
    const string = 'lorem ipsum'
    assert.deepEqual(
      parseConstant(string),
      {
        tail: 'lorem ipsum',
        value: null
      }
    )
  })
})

describe('parseFunction', function () {
  it('handles functions with one argument', function () {
    const string = 'f(a)'
    assert.deepEqual(
      parseFunction(string),
      {
        tail: '',
        value: {
          type: TermType.FUNCTION,
          name: 'f',
          args: [
            {
              type: TermType.CONSTANT,
              name: 'a'
            }
          ]
        }
      }
    )
  })

  it('handles functions with two argument', function () {
    const string = 'f(a,b)'
    assert.deepEqual(
      parseFunction(string),
      {
        tail: '',
        value: {
          type: TermType.FUNCTION,
          name: 'f',
          args: [
            {
              type: TermType.CONSTANT,
              name: 'a'
            },
            {
              type: TermType.CONSTANT,
              name: 'b'
            }
          ]
        }
      }
    )
  })

  it('handles functions other functions as arguments', function () {
    const string = 'f(g(a),h(b))'
    assert.deepEqual(
      parseFunction(string),
      {
        tail: '',
        value: {
          type: TermType.FUNCTION,
          name: 'f',
          args: [
            {
              type: TermType.FUNCTION,
              name: 'g',
              args: [
                {
                  type: TermType.CONSTANT,
                  name: 'a'
                }
              ]
            },
            {
              type: TermType.FUNCTION,
              name: 'h',
              args: [
                {
                  type: TermType.CONSTANT,
                  name: 'b'
                }
              ]
            }
          ]
        }
      }
    )
  })

  it('handles suffixes correctly', function () {
    const string = 'f(a)suffix'
    assert.deepEqual(
      parseFunction(string),
      {
        tail: 'suffix',
        value: {
          type: TermType.FUNCTION,
          name: 'f',
          args: [
            {
              type: TermType.CONSTANT,
              name: 'a'
            }
          ]
        }
      }
    )
  })

  it('disallows zero-arity functions', function () {
    const string = 'f()'
    assert.deepEqual(
      parseFunction(string),
      {
        tail: 'f()',
        value: null
      }
    )
  })
})
