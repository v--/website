import { describe, it, assert, assertEqualExpressions } from '../../../_common.js'

import { ExpressionType } from '../../../../code/client/resolution/enums/expression_type.js'
import { TokenType } from '../../../../code/client/resolution/enums/token_type.js'

import { ParserError } from '../../../../code/common/support/parser.js'
import { parseExpression, parseExpressionSilently } from '../../../../code/client/resolution/syntax/ast.js'

describe('parseExpression()', function() {
  describe('TokenType.VARIABLE', function() {
    it('handles variables without indices', function() {
      const string = 'x'
      assertEqualExpressions(
        parseExpression(string, TokenType.variable),
        {
          type: ExpressionType.variable,
          name: 'x'
        }
      )
    })

    it('handles variables with indices', function() {
      const string = 'x2'
      assertEqualExpressions(
        parseExpression(string, TokenType.variable),
        {
          type: ExpressionType.variable,
          name: 'x2'
        }
      )
    })

    it('fails on non-variables', function() {
      const string = 'f'

      assert.throws(function() {
        parseExpression(string, TokenType.variable)
      }, ParserError)
    })

    it('fails on gibberish', function() {
      const string = 'eWczRqKCIaAOi'

      assert.throws(function() {
        parseExpression(string, TokenType.variable)
      }, ParserError)
    })
  })

  describe('TokenType.FUNCTION', function() {
    it('parses zero-arity functions (constants)', function() {
      const string = 'f'
      assertEqualExpressions(
        parseExpression(string, TokenType.function),
        {
          type: ExpressionType.function,
          name: 'f',
          args: []
        }
      )
    })

    it('handles functions with one argument', function() {
      const string = 'f(g)'
      assertEqualExpressions(
        parseExpression(string, TokenType.function),
        {
          type: ExpressionType.function,
          name: 'f',
          args: [
            {
              type: ExpressionType.function,
              name: 'g',
              args: []
            }
          ]
        }
      )
    })

    it('handles functions with two argument', function() {
      const string = 'f(g, h)'
      assertEqualExpressions(
        parseExpression(string, TokenType.function),
        {
          type: ExpressionType.function,
          name: 'f',
          args: [
            {
              type: ExpressionType.function,
              name: 'g',
              args: []
            },
            {
              type: ExpressionType.function,
              name: 'h',
              args: []
            }
          ]
        }
      )
    })

    it('handles functions other functions as arguments', function() {
      const string = 'f(g1(h1), g2(h2))'
      assertEqualExpressions(
        parseExpression(string, TokenType.function),
        {
          type: ExpressionType.function,
          name: 'f',
          args: [
            {
              type: ExpressionType.function,
              name: 'g1',
              args: [
                {
                  type: ExpressionType.function,
                  name: 'h1',
                  args: []
                }
              ]
            },
            {
              type: ExpressionType.function,
              name: 'g2',
              args: [
                {
                  type: ExpressionType.function,
                  name: 'h2',
                  args: []
                }
              ]
            }
          ]
        }
      )
    })
  })

  describe('TokenType.NEGATION', function() {
    it('handles negation on predicates', function() {
      const string = '!p(f)'
      assert.deepEqual(
        parseExpression(string, TokenType.negation),
        {
          type: ExpressionType.negation,
          formula: {
            type: ExpressionType.predicate,
            name: 'p',
            args: [
              {
                type: ExpressionType.function,
                name: 'f',
                args: []
              }
            ]
          }
        }
      )
    })
  })

  describe('TokenType.UNIVERSAL_QUANTIFICATION', function() {
    it('handles universal formulas', function() {
      const string = 'Ax p(x)'
      assert.deepEqual(
        parseExpression(string, TokenType.universalQuantification),
        {
          type: ExpressionType.universalQuantification,
          variable: 'x',
          formula: {
            type: ExpressionType.predicate,
            name: 'p',
            args: [
              {
                type: ExpressionType.variable,
                name: 'x'
              }
            ]
          }
        }
      )
    })
  })

  describe('TokenType.EXISTENTIAL_QUANTIFICATION', function() {
    it('handles existential formulas', function() {
      const string = 'Ex p(x)'
      assert.deepEqual(
        parseExpression(string, TokenType.existentialQuantification),
        {
          type: ExpressionType.existentialQuantification,
          variable: 'x',
          formula: {
            type: ExpressionType.predicate,
            name: 'p',
            args: [
              {
                type: ExpressionType.variable,
                name: 'x'
              }
            ]
          }
        }
      )
    })
  })

  describe('TokenType.CONJUNCTION', function() {
    it('handles binary conjunctions', function() {
      const string = 'p(f) & p(g)'
      assert.deepEqual(
        parseExpression(string, TokenType.conjunction),
        {
          type: ExpressionType.conjunction,
          formulas: [
            {
              type: ExpressionType.predicate,
              name: 'p',
              args: [
                {
                  type: ExpressionType.function,
                  name: 'f',
                  args: []
                }
              ]
            },
            {
              type: ExpressionType.predicate,
              name: 'p',
              args: [
                {
                  type: ExpressionType.function,
                  name: 'g',
                  args: []
                }
              ]
            }
          ]
        }
      )
    })

    it('handles ternary conjunctions', function() {
      const string = 'p(f) & p(g) & p(h)'
      assert.deepEqual(
        parseExpression(string, TokenType.conjunction),
        {
          type: ExpressionType.conjunction,
          formulas: [
            {
              type: ExpressionType.predicate,
              name: 'p',
              args: [
                {
                  type: ExpressionType.function,
                  name: 'f',
                  args: []
                }
              ]
            },
            {
              type: ExpressionType.predicate,
              name: 'p',
              args: [
                {
                  type: ExpressionType.function,
                  name: 'g',
                  args: []
                }
              ]
            },
            {
              type: ExpressionType.predicate,
              name: 'p',
              args: [
                {
                  type: ExpressionType.function,
                  name: 'h',
                  args: []
                }
              ]
            }
          ]
        }
      )
    })
  })

  describe('TokenType.DISJUNCTION', function() {
    it('handles binary disjunctions', function() {
      const string = 'p(f) v p(g)'
      assert.deepEqual(
        parseExpression(string, TokenType.disjunction),
        {
          type: ExpressionType.disjunction,
          formulas: [
            {
              type: ExpressionType.predicate,
              name: 'p',
              args: [
                {
                  type: ExpressionType.function,
                  name: 'f',
                  args: []
                }
              ]
            },
            {
              type: ExpressionType.predicate,
              name: 'p',
              args: [
                {
                  type: ExpressionType.function,
                  name: 'g',
                  args: []
                }
              ]
            }
          ]
        }
      )
    })

    it('handles ternary disjunctions', function() {
      const string = 'p(f) v p(g) v p(h)'
      assert.deepEqual(
        parseExpression(string, TokenType.disjunction),
        {
          type: ExpressionType.disjunction,
          formulas: [
            {
              type: ExpressionType.predicate,
              name: 'p',
              args: [
                {
                  type: ExpressionType.function,
                  name: 'f',
                  args: []
                }
              ]
            },
            {
              type: ExpressionType.predicate,
              name: 'p',
              args: [
                {
                  type: ExpressionType.function,
                  name: 'g',
                  args: []
                }
              ]
            },
            {
              type: ExpressionType.predicate,
              name: 'p',
              args: [
                {
                  type: ExpressionType.function,
                  name: 'h',
                  args: []
                }
              ]
            }
          ]
        }
      )
    })
  })

  describe('TokenType.IMPLICATION', function() {
    it('handles implication', function() {
      const string = 'p(f) -> p(h)'
      assert.deepEqual(
        parseExpression(string, TokenType.implication),
        {
          type: ExpressionType.implication,
          formulas: [
            {
              type: ExpressionType.predicate,
              name: 'p',
              args: [
                {
                  type: ExpressionType.function,
                  name: 'f',
                  args: []
                }
              ]
            },
            {
              type: ExpressionType.predicate,
              name: 'p',
              args: [
                {
                  type: ExpressionType.function,
                  name: 'h',
                  args: []
                }
              ]
            }
          ]
        }
      )
    })

    it('disallows ternary implication', function() {
      const string = '(p(f)->p(g)->p(h))'

      assert.throws(function() {
        parseExpression(string, TokenType.implication)
      }, ParserError)
    })
  })

  describe('TokenType.EQUIVALENCE', function() {
    it('handles equivalence', function() {
      const string = 'p(f) <-> p(h)'
      assert.deepEqual(
        parseExpression(string, TokenType.equivalence),
        {
          type: ExpressionType.equivalence,
          formulas: [
            {
              type: ExpressionType.predicate,
              name: 'p',
              args: [
                {
                  type: ExpressionType.function,
                  name: 'f',
                  args: []
                }
              ]
            },
            {
              type: ExpressionType.predicate,
              name: 'p',
              args: [
                {
                  type: ExpressionType.function,
                  name: 'h',
                  args: []
                }
              ]
            }
          ]
        }
      )
    })

    it('disallows ternary equivalence', function() {
      const string = 'p(f) <-> p(g) <-> p(h)'

      assert.throws(function() {
        parseExpression(string, TokenType.implication)
      }, ParserError)
    })
  })
})

describe('parseExpressionSilently()', function() {
  it('ignores whitespace around formula', function() {
    assert.deepEqual(
      parseExpressionSilently('   p(f)   '),
      parseExpressionSilently('p(f)')
    )
  })

  it('parses top-level conjunctions without wrapping parentheses', function() {
    assert.deepEqual(
      parseExpressionSilently('p(f) & p(g)'),
      parseExpressionSilently('(p(f) & p(g))')
    )
  })

  it('parses complicated formulas correctly', function() {
    const string = '(Ax Ey (p(x) -> q(f, y)) & !Ex q(x, f))'

    assert.deepEqual(
      parseExpressionSilently(string),
      {
        type: ExpressionType.conjunction,
        formulas: [
          {
            type: ExpressionType.universalQuantification,
            variable: 'x',
            formula: {
              type: ExpressionType.existentialQuantification,
              variable: 'y',
              formula: {
                type: ExpressionType.implication,
                formulas: [
                  {
                    type: ExpressionType.predicate,
                    name: 'p',
                    args: [
                      {
                        type: ExpressionType.variable,
                        name: 'x'
                      }
                    ]
                  },
                  {
                    type: ExpressionType.predicate,
                    name: 'q',
                    args: [
                      {
                        type: ExpressionType.function,
                        name: 'f',
                        args: []
                      },
                      {
                        type: ExpressionType.variable,
                        name: 'y'
                      }
                    ]
                  }
                ]
              }
            }
          },
          {
            type: ExpressionType.negation,
            formula: {
              type: ExpressionType.existentialQuantification,
              variable: 'x',
              formula: {
                type: ExpressionType.predicate,
                name: 'q',
                args: [
                  {
                    type: ExpressionType.variable,
                    name: 'x'
                  },
                  {
                    type: ExpressionType.function,
                    name: 'f',
                    args: []
                  }
                ]
              }
            }
          }
        ]
      }
    )
  })
})
