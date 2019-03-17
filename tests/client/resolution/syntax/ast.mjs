/* globals describe it */

import { assert } from '../../../_common.mjs'

import ExpressionType from '../../../../code/client/resolution/enums/expression_type.mjs'
import TokenType from '../../../../code/client/resolution/enums/token_type.mjs'

import { ParserError } from '../../../../code/client/core/support/parser.mjs'
import { parseExpression, parseTopLevelFormula } from '../../../../code/client/resolution/syntax/ast.mjs'

describe('parseExpression()', function () {
  describe('TokenType.VARIABLE', function () {
    it('handles variables without indices', function () {
      const string = 'x'
      assert.deepEqual(
        parseExpression(string, TokenType.VARIABLE),
        {
          type: ExpressionType.VARIABLE,
          name: 'x'
        }
      )
    })

    it('handles variables with indices', function () {
      const string = 'x2'
      assert.deepEqual(
        parseExpression(string, TokenType.VARIABLE),
        {
          type: ExpressionType.VARIABLE,
          name: 'x2'
        }
      )
    })

    it('fails on non-variables', function () {
      const string = 'f'

      assert.throws(function () {
        parseExpression(string, TokenType.VARIABLE)
      }, ParserError)
    })

    it('fails on gibberish', function () {
      const string = 'lorem ipsum'

      assert.throws(function () {
        parseExpression(string, TokenType.VARIABLE)
      }, ParserError)
    })
  })

  describe('TokenType.FUNCTION', function () {
    it('parses zero-arity functions (constants)', function () {
      const string = 'f'
      assert.deepEqual(
        parseExpression(string, TokenType.FUNCTION),
        {
          type: ExpressionType.FUNCTION,
          name: 'f',
          args: []
        }
      )
    })

    it('handles functions with one argument', function () {
      const string = 'f(g)'
      assert.deepEqual(
        parseExpression(string, TokenType.FUNCTION),
        {
          type: ExpressionType.FUNCTION,
          name: 'f',
          args: [
            {
              type: ExpressionType.FUNCTION,
              name: 'g',
              args: []
            }
          ]
        }
      )
    })

    it('handles functions with two argument', function () {
      const string = 'f(g, h)'
      assert.deepEqual(
        parseExpression(string, TokenType.FUNCTION),
        {
          type: ExpressionType.FUNCTION,
          name: 'f',
          args: [
            {
              type: ExpressionType.FUNCTION,
              name: 'g',
              args: []
            },
            {
              type: ExpressionType.FUNCTION,
              name: 'h',
              args: []
            }
          ]
        }
      )
    })

    it('handles functions other functions as arguments', function () {
      const string = 'f(g1(h1), g2(h2))'
      assert.deepEqual(
        parseExpression(string, TokenType.FUNCTION),
        {
          type: ExpressionType.FUNCTION,
          name: 'f',
          args: [
            {
              type: ExpressionType.FUNCTION,
              name: 'g1',
              args: [
                {
                  type: ExpressionType.FUNCTION,
                  name: 'h1',
                  args: []
                }
              ]
            },
            {
              type: ExpressionType.FUNCTION,
              name: 'g2',
              args: [
                {
                  type: ExpressionType.FUNCTION,
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

  describe('TokenType.NEGATION', function () {
    it('handles negation on predicates', function () {
      const string = '!p(f)'
      assert.deepEqual(
        parseExpression(string, TokenType.NEGATION),
        {
          type: ExpressionType.NEGATION,
          formula: {
            type: ExpressionType.PREDICATE,
            name: 'p',
            args: [
              {
                type: ExpressionType.FUNCTION,
                name: 'f',
                args: []
              }
            ]
          }
        }
      )
    })
  })

  describe('TokenType.UNIVERSAL_QUANTIFICATION', function () {
    it('handles universal formulas', function () {
      const string = 'Ax p(x)'
      assert.deepEqual(
        parseExpression(string, TokenType.UNIVERSAL_QUANTIFICATION),
        {
          type: ExpressionType.UNIVERSAL_QUANTIFICATION,
          variable: 'x',
          formula: {
            type: ExpressionType.PREDICATE,
            name: 'p',
            args: [
              {
                type: ExpressionType.VARIABLE,
                name: 'x'
              }
            ]
          }
        }
      )
    })
  })

  describe('TokenType.EXISTENTIAL_QUANTIFICATION', function () {
    it('handles existential formulas', function () {
      const string = 'Ex p(x)'
      assert.deepEqual(
        parseExpression(string, TokenType.EXISTENTIAL_QUANTIFICATION),
        {
          type: ExpressionType.EXISTENTIAL_QUANTIFICATION,
          variable: 'x',
          formula: {
            type: ExpressionType.PREDICATE,
            name: 'p',
            args: [
              {
                type: ExpressionType.VARIABLE,
                name: 'x'
              }
            ]
          }
        }
      )
    })
  })

  describe('TokenType.CONJUNCTION', function () {
    it('handles binary conjunctions', function () {
      const string = 'p(f) & p(g)'
      assert.deepEqual(
        parseExpression(string, TokenType.CONJUNCTION),
        {
          type: ExpressionType.CONJUNCTION,
          formulas: [
            {
              type: ExpressionType.PREDICATE,
              name: 'p',
              args: [
                {
                  type: ExpressionType.FUNCTION,
                  name: 'f',
                  args: []
                }
              ]
            },
            {
              type: ExpressionType.PREDICATE,
              name: 'p',
              args: [
                {
                  type: ExpressionType.FUNCTION,
                  name: 'g',
                  args: []
                }
              ]
            }
          ]
        }
      )
    })

    it('handles ternary conjunctions', function () {
      const string = 'p(f) & p(g) & p(h)'
      assert.deepEqual(
        parseExpression(string, TokenType.CONJUNCTION),
        {
          type: ExpressionType.CONJUNCTION,
          formulas: [
            {
              type: ExpressionType.PREDICATE,
              name: 'p',
              args: [
                {
                  type: ExpressionType.FUNCTION,
                  name: 'f',
                  args: []
                }
              ]
            },
            {
              type: ExpressionType.PREDICATE,
              name: 'p',
              args: [
                {
                  type: ExpressionType.FUNCTION,
                  name: 'g',
                  args: []
                }
              ]
            },
            {
              type: ExpressionType.PREDICATE,
              name: 'p',
              args: [
                {
                  type: ExpressionType.FUNCTION,
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

  describe('TokenType.DISJUNCTION', function () {
    it('handles binary disjunctions', function () {
      const string = 'p(f) v p(g)'
      assert.deepEqual(
        parseExpression(string, TokenType.DISJUNCTION),
        {
          type: ExpressionType.DISJUNCTION,
          formulas: [
            {
              type: ExpressionType.PREDICATE,
              name: 'p',
              args: [
                {
                  type: ExpressionType.FUNCTION,
                  name: 'f',
                  args: []
                }
              ]
            },
            {
              type: ExpressionType.PREDICATE,
              name: 'p',
              args: [
                {
                  type: ExpressionType.FUNCTION,
                  name: 'g',
                  args: []
                }
              ]
            }
          ]
        }
      )
    })

    it('handles ternary disjunctions', function () {
      const string = 'p(f) v p(g) v p(h)'
      assert.deepEqual(
        parseExpression(string, TokenType.DISJUNCTION),
        {
          type: ExpressionType.DISJUNCTION,
          formulas: [
            {
              type: ExpressionType.PREDICATE,
              name: 'p',
              args: [
                {
                  type: ExpressionType.FUNCTION,
                  name: 'f',
                  args: []
                }
              ]
            },
            {
              type: ExpressionType.PREDICATE,
              name: 'p',
              args: [
                {
                  type: ExpressionType.FUNCTION,
                  name: 'g',
                  args: []
                }
              ]
            },
            {
              type: ExpressionType.PREDICATE,
              name: 'p',
              args: [
                {
                  type: ExpressionType.FUNCTION,
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

  describe('TokenType.IMPLICATION', function () {
    it('handles implication', function () {
      const string = 'p(f) -> p(h)'
      assert.deepEqual(
        parseExpression(string, TokenType.IMPLICATION),
        {
          type: ExpressionType.IMPLICATION,
          formulas: [
            {
              type: ExpressionType.PREDICATE,
              name: 'p',
              args: [
                {
                  type: ExpressionType.FUNCTION,
                  name: 'f',
                  args: []
                }
              ]
            },
            {
              type: ExpressionType.PREDICATE,
              name: 'p',
              args: [
                {
                  type: ExpressionType.FUNCTION,
                  name: 'h',
                  args: []
                }
              ]
            }
          ]
        }
      )
    })

    it('disallows ternary implication', function () {
      const string = '(p(f)->p(g)->p(h))'

      assert.throws(function () {
        parseExpression(string, TokenType.IMPLICATION)
      }, ParserError)
    })
  })

  describe('TokenType.EQUIVALENCE', function () {
    it('handles equivalence', function () {
      const string = 'p(f) <-> p(h)'
      assert.deepEqual(
        parseExpression(string, TokenType.EQUIVALENCE),
        {
          type: ExpressionType.EQUIVALENCE,
          formulas: [
            {
              type: ExpressionType.PREDICATE,
              name: 'p',
              args: [
                {
                  type: ExpressionType.FUNCTION,
                  name: 'f',
                  args: []
                }
              ]
            },
            {
              type: ExpressionType.PREDICATE,
              name: 'p',
              args: [
                {
                  type: ExpressionType.FUNCTION,
                  name: 'h',
                  args: []
                }
              ]
            }
          ]
        }
      )
    })

    it('disallows ternary equivalence', function () {
      const string = 'p(f) <-> p(g) <-> p(h)'

      assert.throws(function () {
        parseExpression(string, TokenType.IMPLICATION)
      }, ParserError)
    })
  })
})

describe('parseTopLevelFormula()', function () {
  it('ignores whitespace around formula', function () {
    assert.deepEqual(
      parseTopLevelFormula('   p(f)   '),
      parseTopLevelFormula('p(f)')
    )
  })

  it('parses top-level conjunctions without wrapping parentheses', function () {
    assert.deepEqual(
      parseTopLevelFormula('p(f) & p(g)'),
      parseTopLevelFormula('(p(f) & p(g))')
    )
  })

  it('parses complicated formulas correctly', function () {
    const string = '(Ax Ey (p(x) -> q(f, y)) & !Ex q(x, f))'

    assert.deepEqual(
      parseTopLevelFormula(string),
      {
        type: ExpressionType.CONJUNCTION,
        formulas: [
          {
            type: ExpressionType.UNIVERSAL_QUANTIFICATION,
            variable: 'x',
            formula: {
              type: ExpressionType.EXISTENTIAL_QUANTIFICATION,
              variable: 'y',
              formula: {
                type: ExpressionType.IMPLICATION,
                formulas: [
                  {
                    type: ExpressionType.PREDICATE,
                    name: 'p',
                    args: [
                      {
                        type: ExpressionType.VARIABLE,
                        name: 'x'
                      }
                    ]
                  },
                  {
                    type: ExpressionType.PREDICATE,
                    name: 'q',
                    args: [
                      {
                        type: ExpressionType.FUNCTION,
                        name: 'f',
                        args: []
                      },
                      {
                        type: ExpressionType.VARIABLE,
                        name: 'y'
                      }
                    ]
                  }
                ]
              }
            }
          },
          {
            type: ExpressionType.NEGATION,
            formula: {
              type: ExpressionType.EXISTENTIAL_QUANTIFICATION,
              variable: 'x',
              formula: {
                type: ExpressionType.PREDICATE,
                name: 'q',
                args: [
                  {
                    type: ExpressionType.VARIABLE,
                    name: 'x'
                  },
                  {
                    type: ExpressionType.FUNCTION,
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
