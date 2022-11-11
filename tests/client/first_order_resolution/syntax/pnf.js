import { describe, it, assertEqualExpressions } from '../../../_common.js'

import { simplify } from '../../../../code/client/first_order_resolution/syntax/simplification.js'
import { convertToPNF } from '../../../../code/client/first_order_resolution/syntax/pnf.js'
import { replaceVariables } from '../../../../code/client/first_order_resolution/syntax/replacement.js'
import { parseExpression } from '../../../../code/client/first_order_resolution/syntax/ast.js'

/** @param {string} string */
function parseSimplified(string) {
  return simplify(parseExpression(string))
}

describe('convertToPNF()', function() {
  it('preserves quantorless formulas', function() {
    const formula = parseSimplified('(p(f1) v p(f2)) & (p(h1) v p(h2))')
    assertEqualExpressions(
      convertToPNF(formula),
      formula
    )
  })

  it('leaves single bound variables intact', function() {
    const formula = parseSimplified('Ax p(x)')
    assertEqualExpressions(
      convertToPNF(formula),
      formula
    )
  })

  it('properly renames multiple bound variables with the same names', function() {
    const termMap = /** @type {TCons.NonStrictMap<string, TResolution.Term>} */ (
      new Map([['x1', { type: 'variable', name: 't1' }]])
    )

    assertEqualExpressions(
      convertToPNF(parseSimplified('(Ax p(x) & Ex q(x))')),
      replaceVariables(parseSimplified('Ax Ex1 (p(x) & q(x1))'), termMap)
    )
  })

  it('properly renames nested bound variables with the same names', function() {
    const termMap = /** @type {TCons.NonStrictMap<string, TResolution.Term>} */ (
      new Map([['y1', { type: 'variable', name: 't1' }]])
    )

    assertEqualExpressions(
      convertToPNF(parseSimplified('Ax (Ex p(x) & q(x))')),
      replaceVariables(parseSimplified('Ax Ey1 (p(y1) & q(x))'), termMap)
    )
  })

  it('moves quantifiers to the front in conjunctive formulas', function() {
    assertEqualExpressions(
      convertToPNF(parseSimplified('(Axp(x) & Eyp(y))')),
      parseSimplified('Ax Ey (p(x) & p(y))')
    )
  })

  it('leaves free variables intact', function() {
    const termMap = /** @type {TCons.NonStrictMap<string, TResolution.Term>} */ (new Map([
      ['x1', { type: 'variable', name: 't1' }],
      ['x2', { type: 'variable', name: 't2' }]
    ]))

    assertEqualExpressions(
      convertToPNF(simplify(parseSimplified('Ay (Ax p(x, y) <-> p(y, x))'))),
      replaceVariables(parseSimplified('Ay Ex1 Ax2 ((!p(x1, y) v p(y, x)) & (p(x2, y) v !p(y, x)))'), termMap)
    )
  })
})
