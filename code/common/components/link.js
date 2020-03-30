import { location$ } from '../shared_observables.js'
import { c } from '../rendering/component.js'
import { classlist } from '../support/dom_properties.js'

export function link (state, children) {
  const childState = {}

  if (state.link) {
    childState.href = encodeURI(state.link)

    if (state.isInternal) {
      childState.click = function click (event) {
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
          return
        }

        location$.next(state.link)
        event.preventDefault()
      }
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

  for (const prop of ['title', 'style']) {
    if (prop in state) {
      childState[prop] = state[prop]
    }
  }

  childState.class = classlist('link', state.class)
  return c('a', childState, ...children)
}
