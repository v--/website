import { c } from '../rendering/component.js'

export function title (state) {
  return c('title', { text: `${state.title} | ivasilev.net` })
}
