/* globals describe it */

import { assert } from '../../../_common.mjs'

import { simplify } from '../../../../code/client/resolution/syntax/simplification.mjs'
import { buildFormula } from '../../../../code/client/resolution/parser/facade.mjs'

describe('simplify', function () {
  it('preserves formulas in cnf', function () {
    const formula = buildFormula('Ex ((p(f) v p(g)) & (p(h) v p(x)))')
    assert.equalFormulas(
      simplify(formula),
      formula
    )
  })

  it('removes equivalences in flat equivalence formulas', function () {
    assert.equalFormulas(
      simplify(buildFormula('(p(x) <-> p(y))')),
      buildFormula('((!p(x) v p(y)) & (p(x) v !p(y)))')
    )
  })

  it('removes implications in flat implication formulas', function () {
    assert.equalFormulas(
      simplify(buildFormula('(p(x) <-> p(y))')),
      buildFormula('((!p(x) v p(y)) & (p(x) v !p(y)))')
    )
  })

  it("moves negations inwards using de Morgan's laws", function () {
    assert.equalFormulas(
      simplify(buildFormula('!(p(x) & p(y))')),
      buildFormula('(!p(x) v !p(y))')
    )
  })

  it('moves negations inwards using quantifier inversion rules', function () {
    assert.equalFormulas(
      simplify(buildFormula('!Ax p(x)')),
      buildFormula('Ex !p(x)')
    )
  })

  it('moves negations inwards in complicated formulas', function () {
    assert.equalFormulas(
      simplify(buildFormula('!Ax (p(x) v p(y))')),
      buildFormula('Ex (!p(x) & !p(y))')
    )
  })

  it('flattens nested disjunctions', function () {
    assert.equalFormulas(
      simplify(buildFormula('((p(x) v p(y)) v p(z))')),
      buildFormula('(p(x) v p(y) v p(z))')
    )
  })

  it('flattens doubly nested disjunctions', function () {
    assert.equalFormulas(
      simplify(buildFormula('((p(x) v (p(y1) v p(y2))) v p(z))')),
      buildFormula('(p(x) v p(y1) v p(y2) v p(z))')
    )
  })

  it('flattens disjunctions obtained from equivalence replacement', function () {
    assert.equalFormulas(
      simplify(buildFormula('((!p(x) & !p(y)) -> p(z))')),
      buildFormula('(p(x) v p(y) v p(z))')
    )
  })

  it('changes DNF formulas to CNF', function () {
    assert.equalFormulas(
      simplify(buildFormula('((p(x) & p(y)) v p(z))')),
      buildFormula('((p(x) v p(z)) & (p(y) v p(z)))')
    )
  })
})
