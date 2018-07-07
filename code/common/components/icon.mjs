import icons from '../icons'
import { SVGComponent } from '../support/svg'

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

  return SVGComponent.safeCreate('svg', rootState,
    SVGComponent.safeCreate('path', { d: icons[state.name] })
  )
}
