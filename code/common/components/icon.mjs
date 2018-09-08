import icons from '../icons.mjs'
import { s } from '../support/svg.mjs'

export default function icon (state) {
  const rootState = { viewBox: '0 0 24 24' }

  if ('click' in state) {
    rootState.click = state.click
  }

  if ('class' in state) {
    rootState.class = `icon ${state.class}`
  } else {
    rootState.class = 'icon'
  }

  return s('svg', rootState,
    s('path', { d: icons[state.name] })
  )
}
