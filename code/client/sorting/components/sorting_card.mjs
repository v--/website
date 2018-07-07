import { map } from '../../../common/support/iteration'
import { c } from '../../../common/component'
import sorter from './sorter'

export default function sortingCard ({ algorithm, states, isRunning, pause, run, reset }) {
  return c('div', { class: 'sorting-card' },
    c('h2', { class: 'sorting-card-title', text: algorithm.name }),
    c('div', { class: 'sorters' },
      ...map(function ({ sequence, state, lastAction }) {
        return c(sorter, { sequence, state, lastAction })
      }, states)
    ),

    c('div', { class: 'quick-info' },
      c('div', { class: 'info stability-info' },
        c('p', { class: 'title', text: 'Stable' }),
        c('p', { class: 'value', text: algorithm.stable ? 'True' : 'False' })
      ),

      c('div', { class: 'info time-info' },
        c('p', { class: 'title', text: 'Time' }),
        c('p', { class: 'value', text: algorithm.time })
      ),

      c('div', { class: 'info space-info' },
        c('p', { class: 'title', text: 'Space' }),
        c('p', { class: 'value', text: algorithm.space })
      )
    ),

    c('div', { class: 'buttons' },
      pause && c('button', {
        class: 'sort-button',
        text: isRunning ? 'Pause' : 'Run',
        click () {
          if (isRunning) {
            pause()
          } else {
            run()
          }
        }
      }),

      c('button', {
        class: 'sort-button',
        text: 'Reset',
        click () {
          reset()
        }
      })
    ),

    c('p', { 'text': 'Added on ' + algorithm.date })
  )
}
