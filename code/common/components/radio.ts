import { spacer } from './spacer.ts'
import { Component, createComponent as c } from '../rendering/component.ts'
import { waitForNextTask } from '../support/async.ts'
import { type Action, type AsyncAction } from '../types/typecons.ts'

interface IRadioState<T extends string> {
  controlValue: T
  selectedValue?: T
  update: Action<T> | AsyncAction<T>
  name: string
  content: string | Component
  labelClass?: string
  inputClass?: string
}

/**
 * A wrapper around HTML radio buttons that handles external state updates and deals with labels.
 *
 * See the description of and comments to the checkbox component.
 */
export function radio<T extends string>(state: IRadioState<T>) {
  const isActive = state.controlValue === state.selectedValue

  return c.html('label',
    {
      class: state.labelClass,
      async click(event: PointerEvent) {
        event.preventDefault()
        await waitForNextTask()
        await state.update(state.controlValue)
      },
    },
    c.html('input', {
      type: 'radio',
      // Firefox preserves values across refreshes unless autocompletion is turned off
      // See https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#autocomplete
      autocomplete: 'off',
      class: state.inputClass,
      name: state.name,
      value: state.controlValue,
      checked: isActive,
    }),
    state.content && c.factory(spacer, { direction: 'horizontal' }),
    state.content && (
      state.content instanceof Component ? state.content : c.html('span', { text: state.content })
    ),
  )
}
