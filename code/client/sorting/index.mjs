import { c } from '../../common/component'
import section from '../../common/components/section'

window.bundles.set('sorting', function playgroundSorting () {
  return c('div', { class: 'page playground-sorting-page' },
    c(section, { title: '/playground/sorting' })
  )
})
