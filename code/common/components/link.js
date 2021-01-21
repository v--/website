import { location$ } from '../shared_observables.js'
import { c } from '../rendering/component.js'
import { classlist } from '../support/dom_properties.js'

/**
 * @typedef {object} ILinkState
 * @property {string} link
 * @property {boolean} [isInternal]
 * @property {boolean} [newTab]
 * @property {string} [class]
 * @property {string} [text]
 * @property {string} [style]
 * @property {string} [title]
 */

/**
 * @typedef {object} IAnchorState
 * @property {string} href
 * @property {string} [text]
 * @property {string} [class]
 * @property {string} [target]
 * @property {string} [title]
 * @property {string} [style]
 * @property {TCons.Action<MouseEvent>} [click]
 */

/**
 * @param {ILinkState} state
 * @param {TComponents.IComponent[]} children
 */
export function link(state, children) {
  /** @type {IAnchorState} */
  const childState = {
    href: encodeURI(state.link)
  }

  if (state.isInternal) {
    childState.click = /** @param {MouseEvent} event */ function click(event) {
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

  if (state.title) {
    childState.title = state.title
  }

  if (state.style) {
    childState.style = state.style
  }

  childState.class = classlist('link', state.class)
  return c('a', childState, ...children)
}
