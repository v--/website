import { map } from '../../common/support/iteration.js'
import { c } from '../../common/rendering/component.js'
import { sectionTitle } from '../../common/components/section_title.js'

import { sortingCard } from './components/sorting_card.js'
import { algorithms } from './algorithms.js'
import { sequences } from './sequences.js'
import { Sorter } from './sorter.js'

/**
 * @param {TRouter.IRouterState} state
 */
export function index({ path, description }) {
  const sorters = algorithms.map(function(algorithm) {
    return Sorter.build(algorithm, sequences)
  })

  return c('div', { class: 'page playground-sorting-page' },
    c(sectionTitle, { text: description, path }),
    c('div', { class: 'sorting-button-container' },
      c('button', {
        class: 'cool-button sorting-top-button',
        text: 'Run all',
        click() {
          for (const sorter of sorters) {
            sorter.run()
          }
        }
      }),

      c('button', {
        class: 'cool-button sorting-top-button',
        text: 'Pause all',
        click() {
          for (const sorter of sorters) {
            sorter.pause()
          }
        }
      }),

      c('button', {
        class: 'cool-button sorting-top-button',
        text: 'Reset all',
        click() {
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
}
