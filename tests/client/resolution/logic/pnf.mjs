/* globals describe it */

import { assert } from '../../../_common.mjs'

import { convertToPNF } from '../../../../code/client/resolution/logic/pnf.mjs'
import { buildFormula } from '../../../../code/client/resolution/parser/facade.mjs'
import TermType from '../../../../code/client/resolution/enums/term_type.mjs'
import FormulaType from '../../../../code/client/resolution/enums/formula_type.mjs'

describe('convertToPNF', function () {
  it('preserves quantorless formulas', function () {
    const formula = buildFormula('((p(a)&p(b))v(p(c1)&p(c2)))')
    assert.deepEqual(
      convertToPNF(formula),
      formula
    )
  })

  it('renames bound variables', function () {
    assert.deepEqual(
      convertToPNF(buildFormula('Axp(x)')),
      {
        type: FormulaType.UNIVERSAL_QUANTIFICATION,
        variable: 't1',
        formula: {
          type: FormulaType.PREDICATE,
          name: 'p',
          args: [
            {
              type: TermType.VARIABLE,
              name: 't1'
            }
          ]
        }
      }
    )
  })

  it('properly renames multiple bound variables with the same names', function () {
    assert.deepEqual(
      convertToPNF(buildFormula('(Axp(x)&Exq(x))')),
      {
        type: FormulaType.UNIVERSAL_QUANTIFICATION,
        variable: 't1',
        formula: {
          type: FormulaType.EXISTENTIAL_QUANTIFICATION,
          variable: 't2',
          formula: {
            type: FormulaType.CONJUNCTION,
            formulas: [
              {
                type: FormulaType.PREDICATE,
                name: 'p',
                args: [
                  {
                    type: TermType.VARIABLE,
                    name: 't1'
                  }
                ]
              },
              {
                type: FormulaType.PREDICATE,
                name: 'q',
                args: [
                  {
                    type: TermType.VARIABLE,
                    name: 't2'
                  }
                ]
              }
            ]
          }
        }
      }
    )
  })

  it('properly renames nested bound variables with the same names', function () {
    assert.deepEqual(
      convertToPNF(buildFormula('Ax(Exp(x)&q(x))')),
      {
        type: FormulaType.UNIVERSAL_QUANTIFICATION,
        variable: 't1',
        formula: {
          type: FormulaType.EXISTENTIAL_QUANTIFICATION,
          variable: 't2',
          formula: {
            type: FormulaType.CONJUNCTION,
            formulas: [
              {
                type: FormulaType.PREDICATE,
                name: 'p',
                args: [
                  {
                    type: TermType.VARIABLE,
                    name: 't2'
                  }
                ]
              },
              {
                type: FormulaType.PREDICATE,
                name: 'q',
                args: [
                  {
                    type: TermType.VARIABLE,
                    name: 't1'
                  }
                ]
              }
            ]
          }
        }
      }
    )
  })

  it('negates formulas in PNF', function () {
    assert.deepEqual(
      convertToPNF(buildFormula('!AxEyp(x,y)')),
      {
        type: FormulaType.EXISTENTIAL_QUANTIFICATION,
        variable: 't1',
        formula: {
          type: FormulaType.UNIVERSAL_QUANTIFICATION,
          variable: 't2',
          formula: {
            type: FormulaType.NEGATION,
            formula: {
              type: FormulaType.PREDICATE,
              name: 'p',
              args: [
                {
                  type: TermType.VARIABLE,
                  name: 't1'
                },
                {
                  type: TermType.VARIABLE,
                  name: 't2'
                }
              ]
            }
          }
        }
      }
    )
  })

  it('moves quantifiers to the front in conjunctive formulas', function () {
    assert.deepEqual(
      convertToPNF(buildFormula('(Axp(x)&Eyp(y))')),
      {
        type: FormulaType.UNIVERSAL_QUANTIFICATION,
        variable: 't1',
        formula: {
          type: FormulaType.EXISTENTIAL_QUANTIFICATION,
          variable: 't2',
          formula: {
            type: FormulaType.CONJUNCTION,
            formulas: [
              {
                type: FormulaType.PREDICATE,
                name: 'p',
                args: [
                  {
                    type: TermType.VARIABLE,
                    name: 't1'
                  }
                ]
              },
              {
                type: FormulaType.PREDICATE,
                name: 'p',
                args: [
                  {
                    type: TermType.VARIABLE,
                    name: 't2'
                  }
                ]
              }
            ]
          }
        }
      }
    )
  })
})
