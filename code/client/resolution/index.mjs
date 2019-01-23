import { Observable } from '../../common/support/observable.mjs'
import { c } from '../../common/rendering/component.mjs'

import textInput from '../../common/components/text_input.mjs'

export default function playgroundResolution () {
  const formulaInputObservable = new Observable({
    label: 'Formula',
    value: 'P => Q',
    validator (value) {
      return 'No'
    },

    callback (value) {
      formulaInputObservable.update({ value })
    }
  })

  return c('div', { class: 'page playground-resolution-page-page' },
    c('div', { class: 'section' },
      c('h1', { class: 'section-title', text: '[WIP] First-order resolution' }),
      c(textInput, formulaInputObservable)
    )
  )
}
