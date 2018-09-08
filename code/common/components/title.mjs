import { c } from '../rendering/component'

export default function title (state) {
  return c('title', { text: `${state.title} | ivasilev.net` })
}
