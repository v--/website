/* globals describe it */

import { assert } from '../../../_common.mjs'

import { convertToNNF } from '../../../../code/client/resolution/syntax/nnf.mjs'
import { buildFormula } from '../../../../code/client/resolution/parser/facade.mjs'

describe('convertToNNF', function () {
  it('preserves formulas in nnf', function () {
    const formula = buildFormula('Ex((p(f)&p(g))v(p(h)&p(x)))')
    assert.equalFormulas(
      convertToNNF(formula),
      formula
    )
  })

  it('removes equivalences in flat equivalence formulas', function () {
    assert.equalFormulas(
      convertToNNF(buildFormula('(p(x)<->p(y))')),
      buildFormula('((!p(x)vp(y))&(p(x)v!p(y)))')
    )
  })

  it('removes implications in flat implication formulas', function () {
    assert.equalFormulas(
      convertToNNF(buildFormula('(p(x)<->p(y))')),
      buildFormula('((!p(x)vp(y))&(p(x)v!p(y)))')
    )
  })

  it("moves negations inwards using de Morgan's laws", function () {
    assert.equalFormulas(
      convertToNNF(buildFormula('!(p(x)&p(y))')),
      buildFormula('(!p(x)v!p(y))')
    )
  })

  it('moves negations inwards using quantifier inversion rules', function () {
    assert.equalFormulas(
      convertToNNF(buildFormula('!Axp(x)')),
      buildFormula('Ex!p(x)')
    )
  })

  it('moves negations inwards in complicated formulas', function () {
    assert.equalFormulas(
      convertToNNF(buildFormula('!Ax(p(x)vp(y))')),
      buildFormula('Ex(!p(x)&!p(y))')
    )
  })

  it('flattens nested disjunctions', function () {
    assert.equalFormulas(
      convertToNNF(buildFormula('((p(x)vp(y))vp(z))')),
      buildFormula('(p(x)vp(y)vp(z))')
    )
  })

  it('flattens doubly nested disjunctions', function () {
    assert.equalFormulas(
      convertToNNF(buildFormula('((p(x)v(p(y1)vp(y2)))vp(z))')),
      buildFormula('(p(x)vp(y1)vp(y2)vp(z))')
    )
  })

  it('flattens disjunctions obtained from equivalence replacement', function () {
    assert.equalFormulas(
      convertToNNF(buildFormula('((!p(x)&!p(y))->p(z))')),
      buildFormula('(p(x)vp(y)vp(z))')
    )
  })

  it('changes DNF formulas to CNF', function () {
    assert.equalFormulas(
      convertToNNF(buildFormula('((p(x)&p(y))vp(z))')),
      buildFormula('((p(x)vp(z))&(p(y)vp(z)))')
    )
  })
})
