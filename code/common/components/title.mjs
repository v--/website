import { c } from '../component'

export default function title(state) {
    return c('title', { text: `${state.title} | ivasilev.net` })
}
