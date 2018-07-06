import { shuffle, range, map, flatten, repeat } from '../../common/support/iteration'
import { c } from '../../common/component'
import section from '../../common/components/section'

const SEQUENCES = [
  {
    name: 'Ascending',
    value: range(1, 26)
  },

  {
    name: 'Descending',
    value: range(25, 0, -1)
  },

  {
    name: 'Shuffled',
    value: shuffle(range(1, 26))
  },

  {
    name: 'Grouped',
    value: flatten(map(i => repeat(i, 5), range(4, 25, 5)))
  }
]

function sorter ({ sequence }) {
  const array = Array.from(sequence.value)
  const sorterRatio = 100 / array.length

  return c('div', { class: 'sorter' },
    c('p', { text: sequence.name }),
    c('div', { class: 'sorter-bars' },
      ...map(function (n) {
        return c('div', {
          class: 'sorter-bar',
          style: `height: ${n * sorterRatio}%; width: ${sorterRatio}%;`
        })
      }, array)
    )
  )
}

window.bundles.set('sorting', function playgroundSorting () {
  return c('div', { class: 'page playground-sorting-page' },
    c(section, { title: '/playground/sorting' },
      c('div', { class: 'sorting-card' },
        c('h2', { class: 'sorting-card-title', text: 'Quick sort' }),
        c('div', { class: 'sorters' },
          ...SEQUENCES.map(function (seq) {
            return c(sorter, { sequence: seq })
          })
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

        c('button', { class: 'sort-button', text: 'Sort' })
      )
    )
  )
})
