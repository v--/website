import { type FactoryComponentType, createComponent as c } from '../rendering/component.ts'
import { waitForNextTask } from '../support/async.ts'
import { classlist } from '../support/dom_properties.ts'
import { type Action, type AsyncAction } from '../types/typecons.ts'
import type { ButtonStyle } from './button.ts'

interface IRadioState<T extends string> {
  controlValue: T
  selectedValue?: T
  update: Action<T> | AsyncAction<T>
  name: string
  content?: string | FactoryComponentType
  labelClass?: string
  inputClass?: string
  buttonStyle?: ButtonStyle
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
      class: classlist(
        state.labelClass,
        state.buttonStyle && 'button-styled-control-label',
        typeof state.buttonStyle === 'string' && `button-${state.buttonStyle}`,
      ),
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
    state.content && (
      state.content instanceof Function ? c.factory(state.content) : c.html('span', { text: state.content })
    ),
  )
}
