import { sort } from '../../../common/support/iteration.js'

import { c } from '../../../common/rendering/component.js'
import { table } from '../../../common/components/table.js'
import { sectionTitle } from '../../../common/components/section_title.js'
import { getMappingDomain } from '../support/mapping.js'

/**
 * @param {TCurves.IState} state
 */
export function curveLegend({ mapping, curves, fitters, enableFitter, disableFitter }) {
  return c('div', { class: 'curve-legend' },
    c(sectionTitle, { class: 'legend-title', text: 'Legend' }),
    c('div', { class: 'data-points' },
      c('div', { class: 'point-pair info-point-pair' },
        c('div', { text: 'x' }),
        c('div', { text: 'y' })
      ),

      ...sort(getMappingDomain(mapping)).map(function(x) {
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
        /** @type {import('../../../common/components/table.js').ITableColumn} */ ({
          class: 'col-checkbox',
          /**
           * @param {TCurves.Curve} entry
           */
          value(entry) {
            const isChecked = fitters.has(entry.fitter)

            return c('input', {
              type: 'checkbox',
              checked: isChecked,
              /**
               * @param {Event} _event
               */
              click(_event) {
                if (isChecked) {
                  disableFitter(entry.fitter)
                } else {
                  enableFitter(entry.fitter)
                }
              }
            })
          }
        }),

        {
          label: 'TCurves.Curve name',
          class: 'col-name',
          /**
           * @param {TCurves.Curve} entry
           */
          value(entry) {
            return c('span', {
              class: entry.cssClass,
              text: entry.fitter.name
            })
          }
        },

        {
          label: 'Expression',
          class: 'col-expression',
          /**
           * @param {TCurves.Curve} entry
           */
          value(entry) {
            return String(entry.curve)
          }
        }
      ]
    })
  )
}
