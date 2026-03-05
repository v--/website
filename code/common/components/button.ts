import { type WebsiteEnvironment } from '../environment.ts'
import { icon } from './icon.ts'
import { Component, type FactoryComponentType, createComponent as c } from '../rendering/component.ts'
import { classlist } from '../support/dom_properties.ts'
import { type IconLibraryId } from '../types/bundles.ts'
import { type Action, type AsyncAction } from '../types/typecons.ts'

export type ButtonStyle = 'success' | 'warning' | 'danger' | 'transparent'

interface IButtonState {
  type?: 'button' | 'submit' | 'reset'
  buttonStyle?: ButtonStyle
  class?: string
  title?: string
  command?: 'open-modal' | 'close' | 'request-close' | 'show-popover' | 'hide-popover' | 'toggle-popover'
  commandfor?: string
  popovertarget?: string
  iconLibId?: IconLibraryId
  iconName?: string
  disabled?: boolean
  text?: string | FactoryComponentType
  click?: Action<PointerEvent> | AsyncAction<PointerEvent>
  pointerdown?: Action<PointerEvent> | AsyncAction<PointerEvent>
  pointerup?: Action<PointerEvent> | AsyncAction<PointerEvent>
}

export function button(state: IButtonState, env: WebsiteEnvironment, children: Readonly<Component[]>) {
  return c.html('button',
    {
      class: classlist(
        state.class,
        state.buttonStyle && `button-${state.buttonStyle}`,
        (state.iconLibId && state.iconName) && 'button-with-icon',
      ),
      type: state.type ?? 'button', // We change the default to "button"
      title: state.title ?? state.text,
      disabled: state.disabled,
      popovertarget: state.popovertarget,
      command: state.command,
      commandfor: state.commandfor,
      click: state.click,
      pointerdown: state.pointerdown,
      pointerup: state.pointerup,
    },
    (state.iconLibId && state.iconName) && c.factory(icon, { libId: state.iconLibId, name: state.iconName }),
    state.text && c.html('span', { text: state.text }),
    ...children,
  )
}
