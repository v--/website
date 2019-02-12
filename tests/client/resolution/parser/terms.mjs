/* globals describe it */

import { assert } from '../../../_common.mjs'

import { parseVariable, parseFunction } from '../../../../code/client/resolution/parser/terms.mjs'
import TermType from '../../../../code/client/resolution/enums/term_type.mjs'

describe('parseVariable', function () {
  it('handles variables without indices', function () {
    const string = 'x'
    assert.deepEqual(
      parseVariable(string),
      {
        tail: '',
        value: {
          type: TermType.VARIABLE,
          name: 'x'
        }
      }
    )
  })

  it('handles variables with indices', function () {
    const string = 'x2'
    assert.deepEqual(
      parseVariable(string),
      {
        tail: '',
        value: {
          type: TermType.VARIABLE,
          name: 'x2'
        }
      }
    )
  })

  it('handles suffixes correctly', function () {
    const string = 'x2suffix'
    assert.deepEqual(
      parseVariable(string),
      {
        tail: 'suffix',
        value: {
          type: TermType.VARIABLE,
          name: 'x2'
        }
      }
    )
  })

  it('fails on non-variables', function () {
    const string = 'f'
    assert.deepEqual(
      parseVariable(string),
      {
        tail: 'f',
        value: null
      }
    )
  })

  it('fails on gibberish', function () {
    const string = 'lorem ipsum'
    assert.deepEqual(
      parseVariable(string),
      {
        tail: 'lorem ipsum',
        value: null
      }
    )
  })
})

describe('parseFunction', function () {
  it('parses zero-arity functions (constants)', function () {
    const string = 'f'
    assert.deepEqual(
      parseFunction(string),
      {
        tail: '',
        value: {
          type: TermType.FUNCTION,
          name: 'f',
          args: []
        }
      }
    )
  })

  it('handles functions with one argument', function () {
    const string = 'f(g)'
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
              args: []
            }
          ]
        }
      }
    )
  })

  it('handles functions with two argument', function () {
    const string = 'f(g,h)'
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
              args: []
            },
            {
              type: TermType.FUNCTION,
              name: 'h',
              args: []
            }
          ]
        }
      }
    )
  })

  it('handles functions other functions as arguments', function () {
    const string = 'f(g1(h1),g2(h2))'
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
              name: 'g1',
              args: [
                {
                  type: TermType.FUNCTION,
                  name: 'h1',
                  args: []
                }
              ]
            },
            {
              type: TermType.FUNCTION,
              name: 'g2',
              args: [
                {
                  type: TermType.FUNCTION,
                  name: 'h2',
                  args: []
                }
              ]
            }
          ]
        }
      }
    )
  })

  it('handles suffixes correctly', function () {
    const string = 'f(g)suffix'
    assert.deepEqual(
      parseFunction(string),
      {
        tail: 'suffix',
        value: {
          type: TermType.FUNCTION,
          name: 'f',
          args: [
            {
              type: TermType.FUNCTION,
              name: 'g',
              args: []
            }
          ]
        }
      }
    )
  })
})
