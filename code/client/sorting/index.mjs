import { map } from '../../common/support/iteration'
import { c } from '../../common/component'
import section from '../../common/components/section'

import SortObservable from './support/sort_observable'
import sortingCard from './components/sorting_card'
import algorithms from './algorithms'
import sequences from './sequences'

export default function playgroundSorting () {
  const observables = algorithms.map(function (algorithm) {
    return new SortObservable(algorithm, sequences)
  })

  return c('div', { class: 'page playground-sorting-page' },
    c(section, { title: 'Sorting visualizations' },
      c('button', {
        class: 'sorting-top-button',
        text: 'Run all',
        click () {
          for (const observable of observables) {
            observable.run()
          }
        }
      }),

      c('button', {
        class: 'sorting-top-button',
        text: 'Pause all',
        click () {
          for (const observable of observables) {
            observable.pause()
          }
        }
      }),

      c('button', {
        class: 'sorting-top-button',
        text: 'Reset all',
        click () {
          for (const observable of observables) {
            observable.reset()
          }
        }
      }),

      c('div', { class: 'sorting-cards' },
        ...map(observable => c(sortingCard, observable), observables)
      )
    )
  )
}
