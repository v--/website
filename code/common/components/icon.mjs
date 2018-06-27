import { XMLComponent } from '../component'
import icons from '../icons'

class SVGComponent extends XMLComponent {
  get namespace () {
    return 'http://www.w3.org/2000/svg'
  }
}

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
