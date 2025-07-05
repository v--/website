import { spacer } from './spacer.ts'
import { Component, c } from '../rendering/component.ts'
import { waitForNextTask } from '../support/async.ts'
import { type Action } from '../types/typecons.ts'

interface ICheckboxState {
  value: boolean
  update: Action<boolean>
  name: string
  content?: string | Component
  labelClass?: string
  inputClass?: string
}

/**
 * An wrapper around HTML checkboxes that handles external state updates and deals with labels.
 *
 * HTML checkboxes have subtleties when checked externally. Their checked attribute acts as a default value,
 * but once the state is manually changed, further external updates to it are ignored.
 * Even with default prevention, this behavior depends on the browser and consistently fails on mobile browsers.
 * We still prevent the default behavior, but our DOM manipulator is adjusted so that checked state
 * is both as a properties and as an attribute, while the indeterminate state --- only as a property.
 */
export function checkbox(state: ICheckboxState) {
  return c('label',
    {
      class: state.labelClass,
      async click(event: PointerEvent) {
        event.preventDefault()
        // Some browsers (e.g. Chrome on Android) sometimes misbehave when the default is prevented and the checked attribute is set immediately afterwards.
        await waitForNextTask()
        state.update(!state.value)
      },
    },
    c('input', {
      type: 'checkbox',
      // Firefox preserves values across refreshes unless autocompletion is turned off
      // See https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#autocomplete
      autocomplete: 'off',
      class: state.inputClass,
      name: state.name,
      checked: state.value,
    }),
    state.content && c(spacer, { direction: 'horizontal' }),
    state.content && (
      state.content instanceof Component ? state.content : c('span', { text: state.content })
    ),
  )
}
