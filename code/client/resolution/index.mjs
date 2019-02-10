import { Observable } from '../../common/support/observable.mjs'
import { c } from '../../common/rendering/component.mjs'
import form from '../../common/components/form.mjs'

import { buildFormula } from './parser/facade.mjs'
import stringifyFormula from './support/stringify_formula.mjs'
import { convertToPNF } from './logic/pnf.mjs'
import { simplify } from './logic/cnf.mjs'
import { negate } from './logic/support.mjs'

export function formulasToText ({ formulas }) {
  return { text: formulas.map(stringifyFormula).join('\n') }
}

export default function playgroundResolution () {
  const axioms = [
    'Az (Ax (Ex p(x) <-> (p(x) & p(y))) v (Ex p(z) -> p(x)))',
    'Ex p(x)'
  ]

  const goal = 'Ey Ax (p(x) -> p(y))'

  const formulasObservable = new Observable({
    formulas: axioms.map(buildFormula).concat([negate(buildFormula(goal))])
  })

  const simplifiedObservable = formulasObservable.map(function ({ formulas }) {
    return {
      formulas: formulas.map(simplify)
    }
  })

  const pnfObservable = simplifiedObservable.map(function ({ formulas }) {
    return {
      formulas: formulas.map(f => convertToPNF(f))
    }
  })

  return c('div', { class: 'page playground-resolution-page-page' },
    c('div', { class: 'section' },
      c('h1', { class: 'section-title', text: '[WIP] First-order resolution' }),
      c(form,
        {
          novalidate: true,
          class: 'form',
          validator (data) {
            for (const formula of data.axioms.split('\n').concat([data.goal]).filter(Boolean)) {
              if (buildFormula(formula) === null) {
                return 'Unrecognized formula: ' + formula
              }
            }
          },
          callback (data) {
            const axioms = data.axioms.split('\n').filter(Boolean).map(buildFormula)
            const goal = buildFormula(data.goal)
            const formulas = axioms.concat([negate(goal)])
            formulasObservable.update({ formulas })
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

      c('h3', { text: 'Formulas' }),
      c('pre', null,
        c('code', formulasObservable.map(formulasToText))
      ),

      c('h3', { text: 'Simplified formulas without → and ↔' }),
      c('pre', null,
        c('code', simplifiedObservable.map(formulasToText))
      ),

      c('h3', { text: 'Prenex normal form' }),
      c('pre', null,
        c('code', pnfObservable.map(formulasToText))
      )
    )
  )
}
