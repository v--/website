import { c } from '../../../common/rendering/component.js'
import { s } from '../../../common/support/svg.js'
import { classlist } from '../../../common/support/dom_properties.js'

export function sorter ({ sequence, state, lastAction }) {
  const sorterRatio = 100 / state.length

  return c('div', { class: 'sorter' },
    c('p', { text: sequence.name }),
    s('svg', { class: 'sorter-bars' },
      ...state.map(function (n, i) {
        const isActor = lastAction && (i === lastAction.i || i === lastAction.j)

        return s('rect', {
          class: classlist(
            'sorter-bar',
            isActor && (lastAction.swapped ? 'swapped' : 'tinted')
          ),

          width: sorterRatio - 1 + '%',
          height: n * sorterRatio + '%',
          x: (i - 1) * sorterRatio + '%',
          y: 100 - n * sorterRatio + '%'
        })
      })
    )
  )
}
