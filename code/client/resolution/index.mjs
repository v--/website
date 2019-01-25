import { Observable } from '../../common/support/observable.mjs'
import { c } from '../../common/rendering/component.mjs'
import form from '../../common/components/form.mjs'

import { parseFormula } from './parser/facade.mjs'
import TermType from './enums/term_type.mjs'
import FormulaType from './enums/formula_type.mjs'

function buildFormula (string) {
  const { value: formula, tail } = parseFormula(string.replace(/\s+/g, ''))

  if (tail.length > 0) {
    return null
  }

  return formula
}

function stringifyFormula (formula) {
  switch (formula.type) {
    case TermType.CONSTANT:
    case TermType.VARIABLE:
      return formula.name

    case TermType.FUNCTION:
    case FormulaType.PREDICATE:
      return formula.name + '(' + formula.args.map(stringifyFormula).join(', ') + ')'

    case FormulaType.NEGATION:
      return '¬' + stringifyFormula(formula.formula)

    case FormulaType.UNIVERSAL_QUANTIFICATION:
      return '∀' + formula.variable + ' ' + stringifyFormula(formula.formula)

    case FormulaType.EXISTENTIAL_QUANTIFICATION:
      return '∃' + formula.variable + ' ' + stringifyFormula(formula.formula)

    case FormulaType.CONJUNCTION:
      return '(' + formula.formulas.map(stringifyFormula).join(' & ') + ')'

    case FormulaType.DISJUNCTION:
      return '(' + formula.formulas.map(stringifyFormula).join(' ∨ ') + ')'

    case FormulaType.IMPLICATION:
      return '(' + formula.formulas.map(stringifyFormula).join(' → ') + ')'

    case FormulaType.EQUIVALENCE:
      return '(' + formula.formulas.map(stringifyFormula).join(' ↔ ') + ')'
  }
}

export default function playgroundResolution () {
  const axioms = [
    'Ax Ay Ez ((p(x) <-> p(y)) v !(p(x) -> p(z)))',
    'Ex p(x)'
  ]

  const goal = 'Ey Ax (p(x) -> p(y))'

  const axiomsObservable = new Observable({
    text: axioms.map(buildFormula).map(stringifyFormula).join('\n')
  })

  const goalObservable = new Observable({
    text: stringifyFormula(buildFormula(goal))
  })

  return c('div', { class: 'page playground-resolution-page-page' },
    c('div', { class: 'section' },
      c('h1', { class: 'section-title', text: '[WIP] First-order resolution' }),
      c(form,
        {
          novalidate: true,
          class: 'form',
          validator (data) {
            for (const axiom of data.axioms.split('\n').concat([data.goal]).filter(Boolean)) {
              if (buildFormula(axiom) === null) {
                return 'Unrecognized formula: ' + axiom
              }
            }
          },
          callback (data) {
            const axioms = data.axioms.split('\n').filter(Boolean).map(buildFormula)
            axiomsObservable.update({
              text: axioms.map(stringifyFormula).join('\n')
            })

            goalObservable.update({
              text: stringifyFormula(buildFormula(data.goal))
            })
          }
        },
        c('label', null,
          c('b', { text: 'Axioms' }),
          c('textarea', { name: 'axioms', text: axioms.join('\n') })
        ),
        c('label', null,
          c('b', { text: 'Goal' }),
          c('input', { name: 'goal', value: goal })
        ),
        c('hr', { style: 'visibility: hidden' }),
        c('button', { type: 'submit', text: 'Try to proove' })
      ),

      c('h3', { text: 'Axioms' }),
      c('pre', null,
        c('code', axiomsObservable)
      ),

      c('h3', { text: 'Goal' }),
      c('pre', null,
        c('code', goalObservable)
      )
    )
  )
}
