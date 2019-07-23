import { c } from '../rendering/component.js'

export default function title (state) {
  return c('title', { text: `${state.title} | ivasilev.net` })
}
