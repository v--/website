import { type ButtonStyle } from './button.ts'
import { type WebsiteEnvironment } from '../environment.ts'
import { Component, createComponent as c } from '../rendering/component.ts'
import { waitForNextTask } from '../support/async.ts'
import { classlist } from '../support/dom_properties.ts'
import { type Action, type AsyncAction } from '../types/typecons.ts'

interface ICheckboxState {
  value: boolean
  update: Action<boolean> | AsyncAction<boolean>
  name: string
  text?: string
  labelClass?: string
  inputClass?: string
  buttonStyle?: boolean | ButtonStyle
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
export function checkbox(state: ICheckboxState, env: WebsiteEnvironment, children: Readonly<Component[]>) {
  return c.html('label',
    {
      class: classlist(
        state.labelClass,
        state.buttonStyle && 'button-styled-control-label',
        typeof state.buttonStyle === 'string' && `button-${state.buttonStyle}`,
      ),
      async click(event: PointerEvent) {
        event.preventDefault()
        // Some browsers (e.g. Chrome on Android) sometimes misbehave when the default is prevented and the checked attribute is set immediately afterwards.
        await waitForNextTask()
        await state.update(!state.value)
      },
    },
    c.html('input', {
      type: 'checkbox',
      // Firefox preserves values across refreshes unless autocompletion is turned off
      // See https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#autocomplete
      autocomplete: 'off',
      class: state.inputClass,
      name: state.name,
      checked: state.value,
    }),
    state.text && c.html('span', { text: state.text }),
    ...children,
  )
}
