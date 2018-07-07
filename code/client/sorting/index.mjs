import { map } from '../../common/support/iteration'
import { c } from '../../common/component'
import section from '../../common/components/section'

import SortObservable from './support/sort_observable'
import sortingCard from './components/sorting_card'
import algorithms from './algorithms'
import sequences from './sequences'

window.bundles.set('sorting', function playgroundSorting () {
  const observables = algorithms.map(function (algorithm) {
    return new SortObservable(algorithm, sequences)
  })

  return c('div', { class: 'page playground-sorting-page' },
    c(section, { title: '/playground/sorting' },
      ...map(observable => c(sortingCard, observable), observables)
    )
  )
})
