/* globals describe it */

import { assert } from '../../../_common.mjs'

import { parse, term, opt, rep, cat, alt, ParserError } from '../../../../code/client/core/support/parser.mjs'

describe('parse()', function () {
  describe('for terminal rules', function () {
    it('parses simple terminal rules', function () {
      const rules = {
        variable: term('x')
      }

      assert.deepEqual(
        parse(rules, 'variable', 'x'),
        { type: 'variable', matches: ['x'] }
      )
    })

    it('checks all terminals in a terminal rule', function () {
      const rules = {
        variable: term('x', 'y')
      }

      assert.deepEqual(
        parse(rules, 'variable', 'y'),
        { type: 'variable', matches: ['y'] }
      )
    })

    it('fails to parse unmatching terminal rules', function () {
      const rules = {
        variable: term('x')
      }

      assert.throws(function () {
        parse(rules, 'variable', 'y')
      }, ParserError)
    })
  })

  describe('for optional rules', function () {
    it('succeeds on unmatched optional terminal rules', function () {
      const rules = {
        optional: opt(term('x'))
      }

      assert.deepEqual(
        parse(rules, 'optional', ''),
        { type: 'optional', matches: [] }
      )
    })

    it('parses anonymous optional terminal rules', function () {
      const rules = {
        optional: opt(term('x'))
      }

      assert.deepEqual(
        parse(rules, 'optional', 'x'),
        { type: 'optional', matches: ['x'] }
      )
    })

    it('parses named optional terminal rules', function () {
      const rules = {
        variable: term('x'),
        optional: opt('variable')
      }

      assert.deepEqual(
        parse(rules, 'optional', 'x'),
        {
          type: 'optional',
          matches: [
            { type: 'variable', matches: ['x'] }
          ]
        }
      )
    })
  })

  describe('for repetition rules', function () {
    it('parses zero repetitions of terminal rules', function () {
      const rules = {
        repetition: rep(term('x'))
      }

      assert.deepEqual(
        parse(rules, 'repetition', ''),
        {
          type: 'repetition',
          matches: []
        }
      )
    })

    it('parses repetitions of anonymous terminal rules', function () {
      const rules = {
        variable: term('x'),
        repetition: rep(term('x'))
      }

      assert.deepEqual(
        parse(rules, 'repetition', 'xxx'),
        {
          type: 'repetition',
          matches: ['x', 'x', 'x']
        }
      )
    })

    it('parses repetitions of named terminal rules', function () {
      const rules = {
        variable: term('x'),
        repetition: rep('variable')
      }

      assert.deepEqual(
        parse(rules, 'repetition', 'xxx'),
        {
          type: 'repetition',
          matches: [
            { type: 'variable', matches: ['x'] },
            { type: 'variable', matches: ['x'] },
            { type: 'variable', matches: ['x'] }
          ]
        }
      )
    })
  })

  describe('for concatenation rules', function () {
    it('parses concatenations of anonymous terminal rules', function () {
      const variable = term('x', 'y')
      const operator = term('+')
      const rules = {
        concatenation: cat(variable, operator, variable)
      }

      assert.deepEqual(
        parse(rules, 'concatenation', 'x+y'),
        {
          type: 'concatenation',
          matches: ['x', '+', 'y']
        }
      )
    })

    it('parses concatenations of named terminal rules', function () {
      const rules = {
        variable: term('x', 'y'),
        operator: term('+'),
        concatenation: cat(
          'variable',
          'operator',
          'variable'
        )
      }

      assert.deepEqual(
        parse(rules, 'concatenation', 'x+y'),
        {
          type: 'concatenation',
          matches: [
            { type: 'variable', matches: ['x'] },
            { type: 'operator', matches: ['+'] },
            { type: 'variable', matches: ['y'] }
          ]
        }
      )
    })
  })

  describe('for alternation rules', function () {
    it('parses alternations of anonymous terminal rules', function () {
      const rules = {
        alternation: alt(
          term('a', 'b'),
          term('x', 'y')
        )
      }

      assert.deepEqual(
        parse(rules, 'alternation', 'a'),
        {
          type: 'alternation',
          matches: ['a']
        }
      )

      assert.deepEqual(
        parse(rules, 'alternation', 'x'),
        {
          type: 'alternation',
          matches: ['x']
        }
      )
    })

    it('parses alternations of named terminal rules', function () {
      const rules = {
        constant: term('a', 'b'),
        variable: term('x', 'y'),
        alternation: alt('constant', 'variable')
      }

      assert.deepEqual(
        parse(rules, 'alternation', 'a'),
        {
          type: 'alternation',
          matches: [
            { type: 'constant', matches: ['a'] }
          ]
        }
      )

      assert.deepEqual(
        parse(rules, 'alternation', 'x'),
        {
          type: 'alternation',
          matches: [
            { type: 'variable', matches: ['x'] }
          ]
        }
      )
    })
  })

  describe('for natural numbers', function () {
    const rules = {
      naturalNumber: cat(
        term('1', '2', '3', '4', '5', '6', '7', '8', '9'),
        rep(
          term('0', '1', '2', '3', '4', '5', '6', '7', '8', '9')
        )
      )
    }

    it('parses single-digit natural numbers', function () {
      assert.deepEqual(
        parse(rules, 'naturalNumber', '1'),
        { type: 'naturalNumber', matches: ['1'] }
      )
    })

    it('parses natural numbers without zero digits', function () {
      assert.deepEqual(
        parse(rules, 'naturalNumber', '123'),
        { type: 'naturalNumber', matches: ['1', '2', '3'] }
      )
    })

    it('parses natural numbers with non-leading zero digits', function () {
      assert.deepEqual(
        parse(rules, 'naturalNumber', '100'),
        { type: 'naturalNumber', matches: ['1', '0', '0'] }
      )
    })

    it('fails to parse natural numbers with leading zero digits', function () {
      assert.throws(function () {
        parse(rules, 'naturalNumber', '01')
      }, ParserError)
    })
  })
})
