import { map } from '../../common/support/iteration.mjs'
import { c } from '../../common/rendering/component.mjs'

import SortObservable from './support/sort_observable.mjs'
import sortingCard from './components/sorting_card.mjs'
import algorithms from './algorithms.mjs'
import sequences from './sequences.mjs'

export default function playgroundSorting () {
  const observables = algorithms.map(function (algorithm) {
    return new SortObservable(algorithm, sequences)
  })

  return c('div', { class: 'page playground-sorting-page' },
    c('div', { class: 'section' },
      c('h1', { class: 'section-title', text: 'Sorting visualizations' }),
      c('div', { class: 'sorting-button-container' },
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
        })
      ),

      c('div', { class: 'sorting-cards' },
        ...map(observable => c(sortingCard, observable), observables)
      )
    )
  )
}
