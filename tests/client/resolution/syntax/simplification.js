import { assert } from '../../../_common.js'

import { simplify } from '../../../../code/client/resolution/syntax/simplification.js'
import { parseTopLevelFormula } from '../../../../code/client/resolution/syntax/ast.js'

describe('simplify()', function () {
  it('preserves formulas in cnf', function () {
    const formula = parseTopLevelFormula('Ex ((p(f) v p(g)) & (p(h) v p(x)))')
    assert.equalExpressions(
      simplify(formula),
      formula
    )
  })

  it('removes equivalences in flat equivalence formulas', function () {
    assert.equalExpressions(
      simplify(parseTopLevelFormula('(p(x) <-> p(y))')),
      parseTopLevelFormula('((!p(x) v p(y)) & (p(x) v !p(y)))')
    )
  })

  it('removes implications in flat implication formulas', function () {
    assert.equalExpressions(
      simplify(parseTopLevelFormula('(p(x) <-> p(y))')),
      parseTopLevelFormula('((!p(x) v p(y)) & (p(x) v !p(y)))')
    )
  })

  it("moves negations inwards using de Morgan's laws", function () {
    assert.equalExpressions(
      simplify(parseTopLevelFormula('!(p(x) & p(y))')),
      parseTopLevelFormula('(!p(x) v !p(y))')
    )
  })

  it('moves negations inwards using quantifier inversion rules', function () {
    assert.equalExpressions(
      simplify(parseTopLevelFormula('!Ax p(x)')),
      parseTopLevelFormula('Ex !p(x)')
    )
  })

  it('moves negations inwards in complicated formulas', function () {
    assert.equalExpressions(
      simplify(parseTopLevelFormula('!Ax (p(x) v p(y))')),
      parseTopLevelFormula('Ex (!p(x) & !p(y))')
    )
  })

  it('flattens nested disjunctions', function () {
    assert.equalExpressions(
      simplify(parseTopLevelFormula('((p(x) v p(y)) v p(z))')),
      parseTopLevelFormula('(p(x) v p(y) v p(z))')
    )
  })

  it('flattens doubly nested disjunctions', function () {
    assert.equalExpressions(
      simplify(parseTopLevelFormula('((p(x) v (p(y1) v p(y2))) v p(z))')),
      parseTopLevelFormula('(p(x) v p(y1) v p(y2) v p(z))')
    )
  })

  it('flattens disjunctions obtained from equivalence replacement', function () {
    assert.equalExpressions(
      simplify(parseTopLevelFormula('((!p(x) & !p(y)) -> p(z))')),
      parseTopLevelFormula('(p(x) v p(y) v p(z))')
    )
  })

  it('changes DNF formulas to CNF', function () {
    assert.equalExpressions(
      simplify(parseTopLevelFormula('((p(x) & p(y)) v p(z))')),
      parseTopLevelFormula('((p(x) v p(z)) & (p(y) v p(z)))')
    )
  })
})
