import { assert } from '../../../_common.js'

import ExpressionType from '../../../../code/client/resolution/enums/expression_type.js'
import { simplify } from '../../../../code/client/resolution/syntax/simplification.js'
import { convertToPNF } from '../../../../code/client/resolution/syntax/pnf.js'
import { replaceVariables } from '../../../../code/client/resolution/syntax/replacement.js'
import { parseTopLevelFormula } from '../../../../code/client/resolution/syntax/ast.js'

describe('convertToPNF', function () {
  it('preserves quantorless formulas', function () {
    const formula = parseTopLevelFormula('(p(f1) v p(f2)) & (p(h1) v p(h2))')
    assert.equalExpressions(
      convertToPNF(formula),
      formula
    )
  })

  it('leaves single bound variables intact', function () {
    const formula = parseTopLevelFormula('Ax p(x)')
    assert.equalExpressions(
      convertToPNF(formula),
      formula
    )
  })

  it('properly renames multiple bound variables with the same names', function () {
    const termMap = new Map([['x1', { type: ExpressionType.VARIABLE, name: 't1' }]])

    assert.equalExpressions(
      convertToPNF(parseTopLevelFormula('(Ax p(x) & Ex q(x))')),
      replaceVariables(parseTopLevelFormula('Ax Ex1 (p(x) & q(x1))'), termMap)
    )
  })

  it('properly renames nested bound variables with the same names', function () {
    const termMap = new Map([['y1', { type: ExpressionType.VARIABLE, name: 't1' }]])

    assert.equalExpressions(
      convertToPNF(parseTopLevelFormula('Ax (Ex p(x) & q(x))')),
      replaceVariables(parseTopLevelFormula('Ax Ey1 (p(y1) & q(x))'), termMap)
    )
  })

  it('moves quantifiers to the front in conjunctive formulas', function () {
    assert.equalExpressions(
      convertToPNF(parseTopLevelFormula('(Axp(x) & Eyp(y))')),
      parseTopLevelFormula('Ax Ey (p(x) & p(y))')
    )
  })

  it('leaves free variables intact', function () {
    const termMap = new Map([
      ['x1', { type: ExpressionType.VARIABLE, name: 't1' }],
      ['x2', { type: ExpressionType.VARIABLE, name: 't2' }]
    ])

    assert.equalExpressions(
      convertToPNF(simplify(parseTopLevelFormula('Ay (Ax p(x, y) <-> p(y, x))'))),
      replaceVariables(parseTopLevelFormula('Ay Ex1 Ax2 ((!p(x1, y) v p(y, x)) & (p(x2, y) v !p(y, x)))'), termMap)
    )
  })
})
