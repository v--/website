import { describe, it, assert, assertEqualExpressions } from '../../../_common.js'

import { ParserError } from '../../../../code/common/support/parser.js'
import { parseExpression, parseExpressionSilently } from '../../../../code/client/first_order_resolution/syntax/ast.js'

describe('parseExpression()', function() {
  describe('variable', function() {
    it('handles variables without indices', function() {
      const string = 'x'
      assertEqualExpressions(
        parseExpression(string, 'variable'),
        {
          type: 'variable',
          name: 'x'
        }
      )
    })

    it('handles variables with indices', function() {
      const string = 'x2'
      assertEqualExpressions(
        parseExpression(string, 'variable'),
        {
          type: 'variable',
          name: 'x2'
        }
      )
    })

    it('fails on non-variables', function() {
      const string = 'f'

      assert.throws(function() {
        parseExpression(string, 'variable')
      }, ParserError)
    })

    it('fails on gibberish', function() {
      const string = 'eWczRqKCIaAOi'

      assert.throws(function() {
        parseExpression(string, 'variable')
      }, ParserError)
    })
  })

  describe('function', function() {
    it('parses zero-arity functions (constants)', function() {
      const string = 'f'
      assertEqualExpressions(
        parseExpression(string, 'function'),
        {
          type: 'function',
          name: 'f',
          args: []
        }
      )
    })

    it('handles functions with one argument', function() {
      const string = 'f(g)'
      assertEqualExpressions(
        parseExpression(string, 'function'),
        {
          type: 'function',
          name: 'f',
          args: [
            {
              type: 'function',
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
        parseExpression(string, 'function'),
        {
          type: 'function',
          name: 'f',
          args: [
            {
              type: 'function',
              name: 'g',
              args: []
            },
            {
              type: 'function',
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
        parseExpression(string, 'function'),
        {
          type: 'function',
          name: 'f',
          args: [
            {
              type: 'function',
              name: 'g1',
              args: [
                {
                  type: 'function',
                  name: 'h1',
                  args: []
                }
              ]
            },
            {
              type: 'function',
              name: 'g2',
              args: [
                {
                  type: 'function',
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

  describe('negation', function() {
    it('handles negation on predicates', function() {
      const string = '!p(f)'
      assert.deepEqual(
        parseExpression(string, 'negation'),
        {
          type: 'negation',
          formula: {
            type: 'predicate',
            name: 'p',
            args: [
              {
                type: 'function',
                name: 'f',
                args: []
              }
            ]
          }
        }
      )
    })
  })

  describe('universalQuantification', function() {
    it('handles universal formulas', function() {
      const string = 'Ax p(x)'
      assert.deepEqual(
        parseExpression(string, 'universalQuantification'),
        {
          type: 'universalQuantification',
          variable: 'x',
          formula: {
            type: 'predicate',
            name: 'p',
            args: [
              {
                type: 'variable',
                name: 'x'
              }
            ]
          }
        }
      )
    })
  })

  describe('existentialQuantification', function() {
    it('handles existential formulas', function() {
      const string = 'Ex p(x)'
      assert.deepEqual(
        parseExpression(string, 'existentialQuantification'),
        {
          type: 'existentialQuantification',
          variable: 'x',
          formula: {
            type: 'predicate',
            name: 'p',
            args: [
              {
                type: 'variable',
                name: 'x'
              }
            ]
          }
        }
      )
    })
  })

  describe('conjunction', function() {
    it('handles binary conjunctions', function() {
      const string = 'p(f) & p(g)'
      assert.deepEqual(
        parseExpression(string, 'conjunction'),
        {
          type: 'conjunction',
          formulas: [
            {
              type: 'predicate',
              name: 'p',
              args: [
                {
                  type: 'function',
                  name: 'f',
                  args: []
                }
              ]
            },
            {
              type: 'predicate',
              name: 'p',
              args: [
                {
                  type: 'function',
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
        parseExpression(string, 'conjunction'),
        {
          type: 'conjunction',
          formulas: [
            {
              type: 'predicate',
              name: 'p',
              args: [
                {
                  type: 'function',
                  name: 'f',
                  args: []
                }
              ]
            },
            {
              type: 'predicate',
              name: 'p',
              args: [
                {
                  type: 'function',
                  name: 'g',
                  args: []
                }
              ]
            },
            {
              type: 'predicate',
              name: 'p',
              args: [
                {
                  type: 'function',
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

  describe('disjunction', function() {
    it('handles binary disjunctions', function() {
      const string = 'p(f) v p(g)'
      assert.deepEqual(
        parseExpression(string, 'disjunction'),
        {
          type: 'disjunction',
          formulas: [
            {
              type: 'predicate',
              name: 'p',
              args: [
                {
                  type: 'function',
                  name: 'f',
                  args: []
                }
              ]
            },
            {
              type: 'predicate',
              name: 'p',
              args: [
                {
                  type: 'function',
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
        parseExpression(string, 'disjunction'),
        {
          type: 'disjunction',
          formulas: [
            {
              type: 'predicate',
              name: 'p',
              args: [
                {
                  type: 'function',
                  name: 'f',
                  args: []
                }
              ]
            },
            {
              type: 'predicate',
              name: 'p',
              args: [
                {
                  type: 'function',
                  name: 'g',
                  args: []
                }
              ]
            },
            {
              type: 'predicate',
              name: 'p',
              args: [
                {
                  type: 'function',
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

  describe('implication', function() {
    it('handles implication', function() {
      const string = 'p(f) -> p(h)'
      assert.deepEqual(
        parseExpression(string, 'implication'),
        {
          type: 'implication',
          formulas: [
            {
              type: 'predicate',
              name: 'p',
              args: [
                {
                  type: 'function',
                  name: 'f',
                  args: []
                }
              ]
            },
            {
              type: 'predicate',
              name: 'p',
              args: [
                {
                  type: 'function',
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
        parseExpression(string, 'implication')
      }, ParserError)
    })
  })

  describe('equivalence', function() {
    it('handles equivalence', function() {
      const string = 'p(f) <-> p(h)'
      assert.deepEqual(
        parseExpression(string, 'equivalence'),
        {
          type: 'equivalence',
          formulas: [
            {
              type: 'predicate',
              name: 'p',
              args: [
                {
                  type: 'function',
                  name: 'f',
                  args: []
                }
              ]
            },
            {
              type: 'predicate',
              name: 'p',
              args: [
                {
                  type: 'function',
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
        parseExpression(string, 'implication')
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
        type: 'conjunction',
        formulas: [
          {
            type: 'universalQuantification',
            variable: 'x',
            formula: {
              type: 'existentialQuantification',
              variable: 'y',
              formula: {
                type: 'implication',
                formulas: [
                  {
                    type: 'predicate',
                    name: 'p',
                    args: [
                      {
                        type: 'variable',
                        name: 'x'
                      }
                    ]
                  },
                  {
                    type: 'predicate',
                    name: 'q',
                    args: [
                      {
                        type: 'function',
                        name: 'f',
                        args: []
                      },
                      {
                        type: 'variable',
                        name: 'y'
                      }
                    ]
                  }
                ]
              }
            }
          },
          {
            type: 'negation',
            formula: {
              type: 'existentialQuantification',
              variable: 'x',
              formula: {
                type: 'predicate',
                name: 'q',
                args: [
                  {
                    type: 'variable',
                    name: 'x'
                  },
                  {
                    type: 'function',
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
