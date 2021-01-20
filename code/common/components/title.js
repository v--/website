import { c } from '../rendering/component.js'

/**
 * @param {TRouter.IRouterStatePartial} state
 */
export function title(state) {
  return c('title', { text: `${state.title} | ivasilev.net` })
}
