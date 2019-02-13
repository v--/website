/* globals describe it */

import { assert } from '../../../_common.mjs'

import TermType from '../../../../code/client/resolution/enums/term_type.mjs'
import { simplify } from '../../../../code/client/resolution/syntax/simplification.mjs'
import { convertToPNF } from '../../../../code/client/resolution/syntax/pnf.mjs'
import { replaceVariables } from '../../../../code/client/resolution/syntax/replacement.mjs'
import { buildFormula } from '../../../../code/client/resolution/parser/facade.mjs'

describe('convertToPNF', function () {
  it('preserves quantorless formulas', function () {
    const formula = buildFormula('((p(f1) v p(f2)) & (p(h1) v p(h2)))')
    assert.equalFormulas(
      convertToPNF(formula),
      formula
    )
  })

  it('leaves single bound variables intact', function () {
    const formula = buildFormula('Ax p(x)')
    assert.equalFormulas(
      convertToPNF(formula),
      formula
    )
  })

  it('properly renames multiple bound variables with the same names', function () {
    const termMap = new Map([['x1', { type: TermType.VARIABLE, name: 't1' }]])

    assert.equalFormulas(
      convertToPNF(buildFormula('(Ax p(x) & Ex q(x))')),
      replaceVariables(buildFormula('Ax Ex1 (p(x) & q(x1))'), termMap)
    )
  })

  it('properly renames nested bound variables with the same names', function () {
    const termMap = new Map([['y1', { type: TermType.VARIABLE, name: 't1' }]])

    assert.equalFormulas(
      convertToPNF(buildFormula('Ax (Ex p(x) & q(x))')),
      replaceVariables(buildFormula('Ax Ey1 (p(y1) & q(x))'), termMap)
    )
  })

  it('moves quantifiers to the front in conjunctive formulas', function () {
    assert.equalFormulas(
      convertToPNF(buildFormula('(Axp(x) & Eyp(y))')),
      buildFormula('Ax Ey (p(x) & p(y))')
    )
  })

  it('leaves free variables intact', function () {
    const termMap = new Map([
      ['x1', { type: TermType.VARIABLE, name: 't1' }],
      ['x2', { type: TermType.VARIABLE, name: 't2' }]
    ])

    assert.equalFormulas(
      convertToPNF(simplify(buildFormula('Ay (Ax p(x, y) <-> p(y, x))'))),
      replaceVariables(buildFormula('Ay Ex1 Ax2 ((!p(x1, y) v p(y, x)) & (p(x2, y) v !p(y, x)))'), termMap)
    )
  })
})
