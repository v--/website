import { c } from '../rendering/component.js'
import { RouterState } from '../support/router_state.js'

export function title(state: RouterState) {
  return c('title', { text: `${state.title} | ivasilev.net` })
}
