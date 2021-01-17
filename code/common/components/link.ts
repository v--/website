import { location$ } from '../shared_observables.js'
import { c, Component } from '../rendering/component.js'
import { classlist } from '../support/dom_properties.js'

export function link(state: {
  link: string,
  isInternal?: boolean,
  newTab?: boolean,
  class?: string,
  text?: string,
  style?: string,
  title?: string
}, children: Component[]) {
  const childState: {
    href: string,
    text?: string,
    class?: string,
    target?: string,
    title?: string,
    style?: string,
    click?: TypeCons.Action<MouseEvent>
  } = {
    href: encodeURI(state.link)
  }

  if (state.isInternal) {
    childState.click = function click(event: MouseEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
        return
      }

      location$.next(state.link)
      event.preventDefault()
    }
  }

  if (state.newTab) {
    childState.target = '_blank'
  }

  if ('text' in state) {
    childState.text = state.text
  } else if (children.length === 0 && state.link) {
    childState.text = state.link
  }

  for (const prop of ['title', 'style'] as const) {
    if (prop in state) {
      childState[prop] = state[prop]
    }
  }

  childState.class = classlist('link', state.class)
  return c('a', childState, ...children)
}
