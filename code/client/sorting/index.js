import { map } from '../../common/support/iteration.js'
import { c } from '../../common/rendering/component.js'

import { sortingCard } from './components/sorting_card.js'
import { algorithms } from './algorithms.js'
import { sequences } from './sequences.js'
import { Sorter } from './sorter.js'

export function index () {
  const sorters = algorithms.map(function (algorithm) {
    return new Sorter(algorithm, sequences)
  })

  return c('div', { class: 'page playground-sorting-page' },
    c('div', { class: 'section' },
      c('h1', { class: 'section-title', text: 'Sorting algorithms visualizations' }),
      c('div', { class: 'sorting-button-container' },
        c('button', {
          class: 'cool-button sorting-top-button',
          text: 'Run all',
          click () {
            for (const sorter of sorters) {
              sorter.run()
            }
          }
        }),

        c('button', {
          class: 'cool-button sorting-top-button',
          text: 'Pause all',
          click () {
            for (const sorter of sorters) {
              sorter.pause()
            }
          }
        }),

        c('button', {
          class: 'cool-button sorting-top-button',
          text: 'Reset all',
          click () {
            for (const sorter of sorters) {
              sorter.reset()
            }
          }
        })
      ),

      c('div', { class: 'sorting-cards' },
        ...map(sorter => c(sortingCard, sorter.state$), sorters)
      )
    )
  )
}
