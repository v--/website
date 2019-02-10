/* globals describe it */

import { assert } from '../../../_common.mjs'

import { simplify } from '../../../../code/client/resolution/logic/cnf.mjs'
import { buildFormula } from '../../../../code/client/resolution/parser/facade.mjs'

describe('simplify', function () {
  it('preserves formulas without equivalences or implications', function () {
    const formula = buildFormula('Ex((p(a)&p(b))v(p(c)&p(x)))')
    assert.deepEqual(
      simplify(formula),
      formula
    )
  })

  it('removes equivalences in flat equivalence formulas', function () {
    assert.deepEqual(
      simplify(buildFormula('(p(x)<->p(y))')),
      buildFormula('((!p(x)vp(y))&(p(x)v!p(y)))')
    )
  })

  it('removes implications in flat implication formulas', function () {
    assert.deepEqual(
      simplify(buildFormula('(p(x)<->p(y))')),
      buildFormula('((!p(x)vp(y))&(p(x)v!p(y)))')
    )
  })
})
