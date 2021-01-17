import { s } from '../support/svg.js'

export const iconMap = new Map()

export function icon(state: {
  name: string,
  class?: string,
  click?: Action<MouseEvent>
}) {
  const rootState: {
    click?: Action<MouseEvent>,
    class: string,
    viewBox: string
  } = { viewBox: '0 0 24 24', class: 'icon' }

  if ('click' in state) {
    rootState.click = state.click
  }

  if ('class' in state) {
    rootState.class = `icon ${state.class}`
  }

  return s('svg', rootState,
    s('path', { d: iconMap.get(state.name) })
  )
}
