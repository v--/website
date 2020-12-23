import { describe, it, assert } from '../../_common.js'

import { parse, term, neg, opt, rep, cat, alt, ParserError } from '../../../code/common/support/parser.js'

enum TokenType {
  variable,
  optional,
  constant,
  repetition,
  concatenation,
  alternation,
  negation,
  operator,
  naturalNumber
}

describe('parse()', function() {
  describe('for terminal rules', function() {
    it('parses simple terminal rules', function() {
      const rules = {
        [TokenType.variable]: term('x')
      }

      assert.deepEqual(
        parse(rules, TokenType.variable, 'x'),
        { type: TokenType.variable, matches: ['x'] }
      )
    })

    it('checks all terminals in a terminal rule', function() {
      const rules = {
        [TokenType.variable]: term('x', 'y')
      }

      assert.deepEqual(
        parse(rules, TokenType.variable, 'y'),
        { type: TokenType.variable, matches: ['y'] }
      )
    })

    it('fails to parse unmatching terminal rules', function() {
      const rules = {
        [TokenType.variable]: term('x')
      }

      assert.throws(function() {
        parse(rules, TokenType.variable, 'y')
      }, ParserError)
    })
  })

  describe('for negation rules', function() {
    it('fails to parse a negation rules', function() {
      const rules = {
        [TokenType.variable]: neg('x')
      }

      assert.throws(function() {
        parse(rules, TokenType.variable, 'x')
      }, ParserError)
    })
  })

  describe('for optional rules', function() {
    it('succeeds on unmatched optional terminal rules', function() {
      const rules = {
        [TokenType.optional]: opt(term('x'))
      }

      assert.deepEqual(
        parse(rules, TokenType.optional, ''),
        { type: TokenType.optional, matches: [] }
      )
    })

    it('parses anonymous optional terminal rules', function() {
      const rules = {
        [TokenType.optional]: opt(term('x'))
      }

      assert.deepEqual(
        parse(rules, TokenType.optional, 'x'),
        { type: TokenType.optional, matches: ['x'] }
      )
    })

    it('parses named optional terminal rules', function() {
      const rules = {
        [TokenType.variable]: term('x'),
        [TokenType.optional]: opt(TokenType.variable)
      }

      assert.deepEqual(
        parse(rules, TokenType.optional, 'x'),
        {
          type: TokenType.optional,
          matches: [
            { type: TokenType.variable, matches: ['x'] }
          ]
        }
      )
    })
  })

  describe('for repetition rules', function() {
    it('parses zero repetitions of terminal rules', function() {
      const rules = {
        [TokenType.repetition]: rep(term('x'))
      }

      assert.deepEqual(
        parse(rules, TokenType.repetition, ''),
        {
          type: TokenType.repetition,
          matches: []
        }
      )
    })

    it('parses repetitions of anonymous terminal rules', function() {
      const rules = {
        [TokenType.variable]: term('x'),
        [TokenType.repetition]: rep(term('x'))
      }

      assert.deepEqual(
        parse(rules, TokenType.repetition, 'xxx'),
        {
          type: TokenType.repetition,
          matches: ['x', 'x', 'x']
        }
      )
    })

    it('parses repetitions of named terminal rules', function() {
      const rules = {
        [TokenType.variable]: term('x'),
        [TokenType.repetition]: rep(TokenType.variable)
      }

      assert.deepEqual(
        parse(rules, TokenType.repetition, 'xxx'),
        {
          type: TokenType.repetition,
          matches: [
            { type: TokenType.variable, matches: ['x'] },
            { type: TokenType.variable, matches: ['x'] },
            { type: TokenType.variable, matches: ['x'] }
          ]
        }
      )
    })
  })

  describe('for concatenation rules', function() {
    it('parses concatenations of anonymous terminal rules', function() {
      const variable = term('x', 'y')
      const operator = term('+')
      const rules = {
        [TokenType.concatenation]: cat(variable, operator, variable)
      }

      assert.deepEqual(
        parse(rules, TokenType.concatenation, 'x+y'),
        {
          type: TokenType.concatenation,
          matches: ['x', '+', 'y']
        }
      )
    })

    it('parses concatenations of named terminal rules', function() {
      const rules = {
        [TokenType.variable]: term('x', 'y'),
        [TokenType.operator]: term('+'),
        [TokenType.concatenation]: cat(
          TokenType.variable,
          TokenType.operator,
          TokenType.variable
        )
      }

      assert.deepEqual(
        parse(rules, TokenType.concatenation, 'x+y'),
        {
          type: TokenType.concatenation,
          matches: [
            { type: TokenType.variable, matches: ['x'] },
            { type: TokenType.operator, matches: ['+'] },
            { type: TokenType.variable, matches: ['y'] }
          ]
        }
      )
    })
  })

  describe('for alternation rules', function() {
    it('parses alternations of anonymous terminal rules', function() {
      const rules = {
        [TokenType.alternation]: alt(
          term('a', 'b'),
          term('x', 'y')
        )
      }

      assert.deepEqual(
        parse(rules, TokenType.alternation, 'a'),
        {
          type: TokenType.alternation,
          matches: ['a']
        }
      )

      assert.deepEqual(
        parse(rules, TokenType.alternation, 'x'),
        {
          type: TokenType.alternation,
          matches: ['x']
        }
      )
    })

    it('parses alternations of named terminal rules', function() {
      const rules = {
        [TokenType.constant]: term('a', 'b'),
        [TokenType.variable]: term('x', 'y'),
        [TokenType.alternation]: alt(TokenType.constant, TokenType.variable)
      }

      assert.deepEqual(
        parse(rules, TokenType.alternation, 'a'),
        {
          type: TokenType.alternation,
          matches: [
            { type: TokenType.constant, matches: ['a'] }
          ]
        }
      )

      assert.deepEqual(
        parse(rules, TokenType.alternation, 'x'),
        {
          type: TokenType.alternation,
          matches: [
            { type: TokenType.variable, matches: ['x'] }
          ]
        }
      )
    })
  })

  describe('for natural numbers', function() {
    const rules = {
      [TokenType.naturalNumber]: cat(
        term('1', '2', '3', '4', '5', '6', '7', '8', '9'),
        rep(
          term('0', '1', '2', '3', '4', '5', '6', '7', '8', '9')
        )
      )
    }

    it('parses single-digit natural numbers', function() {
      assert.deepEqual(
        parse(rules, TokenType.naturalNumber, '1'),
        { type: TokenType.naturalNumber, matches: ['1'] }
      )
    })

    it('parses natural numbers without zero digits', function() {
      assert.deepEqual(
        parse(rules, TokenType.naturalNumber, '123'),
        { type: TokenType.naturalNumber, matches: ['1', '2', '3'] }
      )
    })

    it('parses natural numbers with non-leading zero digits', function() {
      assert.deepEqual(
        parse(rules, TokenType.naturalNumber, '100'),
        { type: TokenType.naturalNumber, matches: ['1', '0', '0'] }
      )
    })

    it('fails to parse natural numbers with leading zero digits', function() {
      assert.throws(function() {
        parse(rules, TokenType.naturalNumber, '01')
      }, ParserError)
    })
  })
})
