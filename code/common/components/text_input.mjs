import { Observable } from '../support/observable.mjs'
import { c } from '../rendering/component.mjs'

export default function textInput ({ label, value, callback, validator, autofocus = false }) {
  const errorLabelObservable = new Observable({
    class: 'text-input-error',
    text: ''
  })

  return c('label', { class: 'text-input-wrapper' },
    c('span', { class: 'text-label', text: label }),
    c('input', {
      class: 'text-input',
      autofocus,
      value,
      input (event) {
        const value = event.target.value
        const error = validator ? validator(value) : ''

        if (error) {
          errorLabelObservable.update({ text: error })
        } else {
          callback(value)
        }
      }
    }),
    c('span', errorLabelObservable)
  )
}
