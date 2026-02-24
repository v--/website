import { spacer } from './spacer.ts'
import { Component, createComponent as c } from '../rendering/component.ts'
import { type float64 } from '../types/numbers.ts'
import { type Action, type AsyncAction } from '../types/typecons.ts'

interface ISliderState<T extends float64 = float64> {
  min: T
  max: T
  value: T
  update: Action<T> | AsyncAction<T>
  name: string
  content?: string | Component
  labelClass?: string
  inputClass?: string
}

/**
 * A wrapper around HTML radio buttons that handles external state updates and deals with labels.
 *
 * See the description of and comments to the checkbox component.
 *
 * It is worse here because it seems impossible to set the value right after the input event.
 * Setting it via an unrelated event seems to work reliably, however.
 */
export function slider<T extends float64 = float64>(state: ISliderState<T>) {
  return c.html('label',
    {
      class: state.labelClass,
      // Compared to checkboxes, it is worse here because preventDefault does nothing
      // and, on mobile browsers, even label's click event may not.
      // So we resort to using the input event.
      async input(event: PointerEvent) {
        const target = event.target as HTMLInputElement
        const value = parseFloat(target.value) as T
        await state.update(value)
      },
    },
    c.html('input', {
      type: 'range',
      class: state.inputClass,
      name: state.name,
      value: state.value,
      min: state.min,
      max: state.max,
    }),
    state.content && c.factory(spacer, { direction: 'horizontal' }),
    state.content && (
      state.content instanceof Component ? state.content : c.html('span', { text: state.content })
    ),
  )
}
