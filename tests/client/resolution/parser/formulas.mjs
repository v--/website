/* globals describe it */

import { assert } from '../../../_common.mjs'

import { parseNegation, parseQuantification, parseConnectiveFormula, parseFormula } from '../../../../code/client/resolution/parser/formulas.mjs'
import TermType from '../../../../code/client/resolution/enums/term_type.mjs'
import FormulaType from '../../../../code/client/resolution/enums/formula_type.mjs'

describe('parseNegation', function () {
  it('handles negation on predicates', function () {
    const string = '!p(f)'
    assert.deepEqual(
      parseNegation(string),
      {
        tail: '',
        value: {
          type: FormulaType.NEGATION,
          formula: {
            type: FormulaType.PREDICATE,
            name: 'p',
            args: [
              {
                type: TermType.FUNCTION,
                name: 'f',
                args: []
              }
            ]
          }
        }
      }
    )
  })
})

describe('parseQuantification', function () {
  it('handles universal formulas', function () {
    const string = 'Axp(x)'
    assert.deepEqual(
      parseQuantification(string),
      {
        tail: '',
        value: {
          type: FormulaType.UNIVERSAL_QUANTIFICATION,
          variable: 'x',
          formula: {
            type: FormulaType.PREDICATE,
            name: 'p',
            args: [
              {
                type: TermType.VARIABLE,
                name: 'x'
              }
            ]
          }
        }
      }
    )
  })

  it('handles existential formulas', function () {
    const string = 'Exp(x)'
    assert.deepEqual(
      parseQuantification(string),
      {
        tail: '',
        value: {
          type: FormulaType.EXISTENTIAL_QUANTIFICATION,
          variable: 'x',
          formula: {
            type: FormulaType.PREDICATE,
            name: 'p',
            args: [
              {
                type: TermType.VARIABLE,
                name: 'x'
              }
            ]
          }
        }
      }
    )
  })
})

describe('parseConnectiveFormula', function () {
  it('handles binary conjunctions', function () {
    const string = '(p(f)&p(g))'
    assert.deepEqual(
      parseConnectiveFormula(string),
      {
        tail: '',
        value: {
          type: FormulaType.CONJUNCTION,
          formulas: [
            {
              type: FormulaType.PREDICATE,
              name: 'p',
              args: [
                {
                  type: TermType.FUNCTION,
                  name: 'f',
                  args: []
                }
              ]
            },
            {
              type: FormulaType.PREDICATE,
              name: 'p',
              args: [
                {
                  type: TermType.FUNCTION,
                  name: 'g',
                  args: []
                }
              ]
            }
          ]
        }
      }
    )
  })

  it('handles ternary conjunctions', function () {
    const string = '(p(f)&p(g)&p(h))'
    assert.deepEqual(
      parseConnectiveFormula(string),
      {
        tail: '',
        value: {
          type: FormulaType.CONJUNCTION,
          formulas: [
            {
              type: FormulaType.PREDICATE,
              name: 'p',
              args: [
                {
                  type: TermType.FUNCTION,
                  name: 'f',
                  args: []
                }
              ]
            },
            {
              type: FormulaType.PREDICATE,
              name: 'p',
              args: [
                {
                  type: TermType.FUNCTION,
                  name: 'g',
                  args: []
                }
              ]
            },
            {
              type: FormulaType.PREDICATE,
              name: 'p',
              args: [
                {
                  type: TermType.FUNCTION,
                  name: 'h',
                  args: []
                }
              ]
            }
          ]
        }
      }
    )
  })

  it('handles ternary disjunctions', function () {
    const string = '(p(f)vp(g)vp(h))'
    assert.deepEqual(
      parseConnectiveFormula(string),
      {
        tail: '',
        value: {
          type: FormulaType.DISJUNCTION,
          formulas: [
            {
              type: FormulaType.PREDICATE,
              name: 'p',
              args: [
                {
                  type: TermType.FUNCTION,
                  name: 'f',
                  args: []
                }
              ]
            },
            {
              type: FormulaType.PREDICATE,
              name: 'p',
              args: [
                {
                  type: TermType.FUNCTION,
                  name: 'g',
                  args: []
                }
              ]
            },
            {
              type: FormulaType.PREDICATE,
              name: 'p',
              args: [
                {
                  type: TermType.FUNCTION,
                  name: 'h',
                  args: []
                }
              ]
            }
          ]
        }
      }
    )
  })

  it('handles ternary disjunctions', function () {
    const string = '(p(f)vp(g)vp(h))'
    assert.deepEqual(
      parseConnectiveFormula(string),
      {
        tail: '',
        value: {
          type: FormulaType.DISJUNCTION,
          formulas: [
            {
              type: FormulaType.PREDICATE,
              name: 'p',
              args: [
                {
                  type: TermType.FUNCTION,
                  name: 'f',
                  args: []
                }
              ]
            },
            {
              type: FormulaType.PREDICATE,
              name: 'p',
              args: [
                {
                  type: TermType.FUNCTION,
                  name: 'g',
                  args: []
                }
              ]
            },
            {
              type: FormulaType.PREDICATE,
              name: 'p',
              args: [
                {
                  type: TermType.FUNCTION,
                  name: 'h',
                  args: []
                }
              ]
            }
          ]
        }
      }
    )
  })

  it('handles implication', function () {
    const string = '(p(f)->p(h))'
    assert.deepEqual(
      parseConnectiveFormula(string),
      {
        tail: '',
        value: {
          type: FormulaType.IMPLICATION,
          formulas: [
            {
              type: FormulaType.PREDICATE,
              name: 'p',
              args: [
                {
                  type: TermType.FUNCTION,
                  name: 'f',
                  args: []
                }
              ]
            },
            {
              type: FormulaType.PREDICATE,
              name: 'p',
              args: [
                {
                  type: TermType.FUNCTION,
                  name: 'h',
                  args: []
                }
              ]
            }
          ]
        }
      }
    )
  })

  it('handles equivalence', function () {
    const string = '(p(f)<->p(h))'
    assert.deepEqual(
      parseConnectiveFormula(string),
      {
        tail: '',
        value: {
          type: FormulaType.EQUIVALENCE,
          formulas: [
            {
              type: FormulaType.PREDICATE,
              name: 'p',
              args: [
                {
                  type: TermType.FUNCTION,
                  name: 'f',
                  args: []
                }
              ]
            },
            {
              type: FormulaType.PREDICATE,
              name: 'p',
              args: [
                {
                  type: TermType.FUNCTION,
                  name: 'h',
                  args: []
                }
              ]
            }
          ]
        }
      }
    )
  })

  it('disallows ternary implication', function () {
    const string = '(p(f)->p(g)->p(h))'
    assert.deepEqual(
      parseConnectiveFormula(string),
      {
        tail: string,
        value: null
      }
    )
  })

  it('disallows ternary equivalence', function () {
    const string = '(p(f)<->p(g)<->p(h))'
    assert.deepEqual(
      parseConnectiveFormula(string),
      {
        tail: string,
        value: null
      }
    )
  })

  it('disallows mixed connectives', function () {
    const string = '(p(f)&p(g)<->p(h))'
    assert.deepEqual(
      parseConnectiveFormula(string),
      {
        tail: string,
        value: null
      }
    )
  })

  // This is a test for a bug fix
  it('disallows unfinished formulas', function () {
    const string = '(p(f)&p(g)'
    assert.deepEqual(
      parseConnectiveFormula(string),
      {
        tail: string,
        value: null
      }
    )
  })
})

describe('parseFormula', function () {
  it('parses complicated formulas correctly', function () {
    const string = '(AxEy(p(x)->q(f,y))&!Exq(x,f))'
    assert.deepEqual(
      parseFormula(string),
      {
        tail: '',
        value: {
          type: FormulaType.CONJUNCTION,
          formulas: [
            {
              type: FormulaType.UNIVERSAL_QUANTIFICATION,
              variable: 'x',
              formula: {
                type: FormulaType.EXISTENTIAL_QUANTIFICATION,
                variable: 'y',
                formula: {
                  type: FormulaType.IMPLICATION,
                  formulas: [
                    {
                      type: FormulaType.PREDICATE,
                      name: 'p',
                      args: [
                        {
                          type: TermType.VARIABLE,
                          name: 'x'
                        }
                      ]
                    },
                    {
                      type: FormulaType.PREDICATE,
                      name: 'q',
                      args: [
                        {
                          type: TermType.FUNCTION,
                          name: 'f',
                          args: []
                        },
                        {
                          type: TermType.VARIABLE,
                          name: 'y'
                        }
                      ]
                    }
                  ]
                }
              }
            },
            {
              type: FormulaType.NEGATION,
              formula: {
                type: FormulaType.EXISTENTIAL_QUANTIFICATION,
                variable: 'x',
                formula: {
                  type: FormulaType.PREDICATE,
                  name: 'q',
                  args: [
                    {
                      type: TermType.VARIABLE,
                      name: 'x'
                    },
                    {
                      type: TermType.FUNCTION,
                      name: 'f',
                      args: []
                    }
                  ]
                }
              }
            }
          ]
        }
      }
    )
  })
})
