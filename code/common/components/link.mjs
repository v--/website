import { redirection } from '../observables.mjs'
import { c } from '../rendering/component.mjs'

export default function link (state, children) {
  const childState = {}

  if (state.link) {
    childState.href = encodeURI(state.link)

    if (state.isInternal) {
      childState.click = function click (event) {
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
        redirection.emit(state.link)
        event.preventDefault()
      }
    }
  }

  if ('text' in state) {
    childState.text = state.text
  } else if (children.length === 0 && state.link) {
    childState.text = state.link
  }

  if (state.class) {
    childState.class = state.class
  }

  return c('a', childState, ...children)
}
