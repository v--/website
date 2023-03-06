import { location$ } from '../shared_observables.js'
import { c } from '../rendering/component.js'
import { classlist } from '../support/dom_properties.js'

/**
 * @typedef {{
  href: string
  rel?: string
  isInternal?: boolean
  newTab?: boolean
  class?: string
  text?: string
  style?: string
  title?: string
 }} IAnchorState
 */

/**
 * @typedef {{
  href: string
  rel?: string
  class?: string
  text?: string
  target?: string
  title?: string
  style?: string
  click?: TCons.Action<MouseEvent>
 }} IAnchorElementState
 */

/**
 * @param {IAnchorState} state
 * @param {TComponents.IComponent[]} children
 */
export function anchor(state, children) {
  /** @type {IAnchorElementState} */
  const childState = {
    href: encodeURI(state.href)
  }

  if (state.isInternal) {
    childState.click = /** @param {MouseEvent} event */ function click(event) {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
        return
      }

      location$.next(state.href)
      event.preventDefault()
    }
  }

  if (state.newTab) {
    childState.target = '_blank'
  }

  if ('text' in state) {
    childState.text = state.text
  } else if (children.length === 0 && state.href) {
    childState.text = state.href
  }

  if (state.rel) {
    childState.rel = state.rel
  }

  if (state.title) {
    childState.title = state.title
  }

  if (state.style) {
    childState.style = state.style
  }

  childState.class = classlist('link', state.class)
  return c('a', childState, ...children)
}
