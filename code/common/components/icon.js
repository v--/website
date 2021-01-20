import { s } from '../support/svg.js'

/** @type { Map<string, string> } */
export const iconMap = new Map()

/**
  @param {{
    name: string,
    class?: string,
    click?: TCons.Action<MouseEvent>
  }} state
 */
export function icon(state) {
  /**
   * @type {{
      click?: TCons.Action<MouseEvent>,
      class: string,
      viewBox: string
    }}
   */
  const rootState = { viewBox: '0 0 24 24', class: 'icon' }

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
