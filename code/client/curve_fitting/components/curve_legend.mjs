import { sort } from '../../../common/support/iteration.mjs'
import { styles } from '../../../common/support/dom_properties.mjs'

import { c } from '../../../common/rendering/component.mjs'
import table from '../../../common/components/table.mjs'

export default function curveLegend ({ mapping, curves, fittersShown }) {
  return c('div', { class: 'curve-legend' },
    c('h1', { class: 'section legend-title', text: 'Legend' }),
    c('div', { class: 'data-points' },
      c('div', { class: 'point-pair info-point-pair' },
        c('div', { text: 'x' }),
        c('div', { text: 'y' })
      ),

      ...sort(mapping.domain).map(function (x) {
        return c('div', { class: 'point-pair' },
          c('div', { text: x }),
          c('div', { text: mapping.get(x) })
        )
      })
    ),

    c(table, {
      class: 'curve-table',
      data: curves,
      columns: [
        {
          class: 'col-checkbox',
          value (entry) {
            return c('input', {
              type: 'checkbox',
              checked: fittersShown.get(entry.fitter),
              click (event) {
                entry.toggle()
              }
            })
          }
        },

        {
          label: 'Curve name',
          class: 'col-name',
          value (entry) {
            return c('span', {
              style: styles({ color: entry.color }),
              text: entry.fitter.name
            })
          }
        },

        {
          label: 'Expression',
          class: 'col-expression',
          value (entry) {
            return String(entry.curve)
          }
        },

        {
          label: 'Added on',
          class: 'col-date',
          value (entry) {
            return String(entry.fitter.date)
          }
        }
      ]
    })
  )
}
