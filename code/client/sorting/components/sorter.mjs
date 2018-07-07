import { c } from '../../../common/component'
import { classlist, styles } from '../../../common/support/dom_properties'

export default function sorter ({ sequence, state, lastAction }) {
  const sorterRatio = 100 / state.length

  return c('div', { class: 'sorter' },
    c('p', { text: sequence.name }),
    c('div', { class: 'sorter-bars' },
      ...state.map(function (n, i) {
        const isActor = lastAction && (i === lastAction.i || i === lastAction.j)

        return c('div', {
          class: classlist(
            'sorter-bar',
            isActor && (lastAction.swapped ? 'swapped' : 'tinted')
          ),

          style: styles({
            height: n * sorterRatio + '%',
            width: sorterRatio + '%'
          })
        })
      })
    )
  )
}
