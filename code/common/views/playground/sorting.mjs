import { c } from '../../component'
import section from '../../components/section'

export default function playgroundSorting () {
  return c('div', { class: 'page playground-sorting-page' },
    c(section, { title: '/playground/sorting' })
  )
}
