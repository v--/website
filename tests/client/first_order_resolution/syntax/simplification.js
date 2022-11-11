import { describe, it, assertEqualExpressions } from '../../../_common.js'

import { simplify } from '../../../../code/client/first_order_resolution/syntax/simplification.js'
import { parseExpression } from '../../../../code/client/first_order_resolution/syntax/ast.js'

describe('simplify()', function() {
  it('preserves formulas in cnf', function() {
    const formula = parseExpression('Ex ((p(f) v p(g)) & (p(h) v p(x)))')
    assertEqualExpressions(
      simplify(formula),
      formula
    )
  })

  it('removes equivalences in flat equivalence formulas', function() {
    assertEqualExpressions(
      simplify(parseExpression('(p(x) <-> p(y))')),
      parseExpression('((!p(x) v p(y)) & (p(x) v !p(y)))')
    )
  })

  it('removes implications in flat implication formulas', function() {
    assertEqualExpressions(
      simplify(parseExpression('(p(x) <-> p(y))')),
      parseExpression('((!p(x) v p(y)) & (p(x) v !p(y)))')
    )
  })

  it("moves negations inwards using de Morgan's laws", function() {
    assertEqualExpressions(
      simplify(parseExpression('!(p(x) & p(y))')),
      parseExpression('(!p(x) v !p(y))')
    )
  })

  it('moves negations inwards using quantifier inversion rules', function() {
    assertEqualExpressions(
      simplify(parseExpression('!Ax p(x)')),
      parseExpression('Ex !p(x)')
    )
  })

  it('moves negations inwards in complicated formulas', function() {
    assertEqualExpressions(
      simplify(parseExpression('!Ax (p(x) v p(y))')),
      parseExpression('Ex (!p(x) & !p(y))')
    )
  })

  it('flattens nested disjunctions', function() {
    assertEqualExpressions(
      simplify(parseExpression('((p(x) v p(y)) v p(z))')),
      parseExpression('(p(x) v p(y) v p(z))')
    )
  })

  it('flattens doubly nested disjunctions', function() {
    assertEqualExpressions(
      simplify(parseExpression('((p(x) v (p(y1) v p(y2))) v p(z))')),
      parseExpression('(p(x) v p(y1) v p(y2) v p(z))')
    )
  })

  it('flattens disjunctions obtained from equivalence replacement', function() {
    assertEqualExpressions(
      simplify(parseExpression('((!p(x) & !p(y)) -> p(z))')),
      parseExpression('(p(x) v p(y) v p(z))')
    )
  })

  it('changes DNF formulas to CNF', function() {
    assertEqualExpressions(
      simplify(parseExpression('((p(x) & p(y)) v p(z))')),
      parseExpression('((p(x) v p(z)) & (p(y) v p(z)))')
    )
  })
})
