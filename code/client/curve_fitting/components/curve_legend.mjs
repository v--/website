import { sort } from '../../../common/support/iteration'

import { c } from '../../../common/component'
import table from '../../../common/components/table'

export default function curveLegend ({ mapping, curves }) {
  return c('div', { class: 'curve-legend' },
    c('h3', { text: 'Data points' }),
    c('div', { class: 'data-points' },
      c('div', { class: 'point-pair info-point-pair' },
        c('div', { 'text': 'x' }),
        c('div', { 'text': 'y' })
      ),

      ...sort(mapping.domain).map(function (x) {
        return c('div', { class: 'point-pair' },
          c('div', { 'text': x }),
          c('div', { 'text': mapping.get(x) })
        )
      })
    ),

    c('h3', { text: 'Curves' }),
    c(table, {
      class: 'curve-table',
      data: curves,
      columns: [
        {
          label: 'Curve name',
          value (entry) {
            return entry.fitter.name
          }
        },

        {
          label: 'Expression',
          value (entry) {
            return String(entry.curve)
          }
        }
      ]
    })
  )
}
