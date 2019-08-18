import { sort } from '../../../common/support/iteration.js'
import { styles } from '../../../common/support/dom_properties.js'
import { redirection } from '../../../common/global_subjects.js'

import { c } from '../../../common/rendering/component.js'
import table from '../../../common/components/table.js'

export default function curveLegend ({ mapping, curves, enabled, config }) {
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
            const isChecked = enabled.has(entry.fitter)

            return c('input', {
              type: 'checkbox',
              checked: isChecked,
              click (_event) {
                const newFitters = isChecked ? enabled.remove(entry.fitter) : enabled.add(entry.fitter)
                redirection.next(config.getUpdatedPath({ enabled: newFitters }))
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
