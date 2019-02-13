/* globals describe it */

import { assert } from '../../../_common.mjs'

import { convertToCNF } from '../../../../code/client/resolution/syntax/cnf.mjs'
import { convertToPNF } from '../../../../code/client/resolution/syntax/pnf.mjs'
import { buildFormula } from '../../../../code/client/resolution/parser/facade.mjs'
import TermType from '../../../../code/client/resolution/enums/term_type.mjs'
import FormulaType from '../../../../code/client/resolution/enums/formula_type.mjs'

describe('convertToPNF', function () {
  it('preserves quantorless formulas', function () {
    const formula = buildFormula('((p(f1)vp(f2))&(p(h1)vp(h2)))')
    assert.equalFormulas(
      convertToPNF(formula),
      formula
    )
  })

  it('renames bound variables', function () {
    assert.equalFormulas(
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
    assert.equalFormulas(
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
    assert.equalFormulas(
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
    assert.equalFormulas(
      convertToPNF(convertToCNF(buildFormula('!AxEyp(x,y)'))),
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
    assert.equalFormulas(
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
