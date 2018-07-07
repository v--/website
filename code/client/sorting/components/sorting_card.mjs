import { map } from '../../../common/support/iteration'
import { c } from '../../../common/component'
import sorter from './sorter'

export default function sortingCard ({ states, sort }) {
  return c('div', { class: 'sorting-card' },
    c('h2', { class: 'sorting-card-title', text: 'Quick sort' }),
    c('div', { class: 'sorters' },
      ...map(function ({ sequence, state, lastAction }) {
        return c(sorter, { sequence, state, lastAction })
      }, states)
    ),

    c('div', { class: 'quick-info' },
      c('div', { class: 'info stability-info' },
        c('p', { class: 'title', text: 'Stable' }),
        c('p', { class: 'value', text: 'True' })
      ),

      c('div', { class: 'info time-info' },
        c('p', { class: 'title', text: 'Time' }),
        c('p', { class: 'value', text: 'O(n²)' })
      ),

      c('div', { class: 'info space-info' },
        c('p', { class: 'title', text: 'Space' }),
        c('p', { class: 'value', text: 'O(n)' })
      )
    ),

    c('button', {
      class: 'sort-button',
      text: 'Sort',
      click () {
        sort()
      }
    })
  )
}
