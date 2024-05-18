import { CoolError } from '../errors'
import { s } from '../support/svg.js'

/**
 * @typedef {{viewBox: string, path: string}} IconSpec
 */

class InvalidIconError extends CoolError {}

/** @type { Map<string, IconSpec> } */
export const iconMap = new Map()

/**
  @param {{
    name: string,
    class?: string,
    click?: TCons.Action<MouseEvent>
  }} state
 */
export function icon(state) {
  const spec = iconMap.get(state.name)

  if (spec === undefined) {
    throw new InvalidIconError(`Invalid icon ${state.name}`)
  }

  /**
   * @type {{
      click?: TCons.Action<MouseEvent>,
      class: string,
      viewBox: string
    }}
   */
  const rootState = { viewBox: spec.viewBox, class: 'icon' }

  if ('click' in state) {
    rootState.click = state.click
  }

  if ('class' in state) {
    rootState.class = `icon ${state.class}`
  }

  return s('svg', rootState,
    s('path', { d: spec.path })
  )
}
