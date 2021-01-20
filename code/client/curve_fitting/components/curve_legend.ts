import { sort } from '../../../common/support/iteration.js'

import { c } from '../../../common/rendering/component.js'
import { ITableColumn, table } from '../../../common/components/table.js'
import { sectionTitle } from '../../../common/components/section_title.js'
import { CurveFittingState } from '../types/state.js'
import { getMappingDomain } from '../support/mapping.js'

export function curveLegend({ mapping, curves, fitters, enableFitter, disableFitter }: CurveFittingState) {
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
        {
          class: 'col-checkbox',
          value(entry: TCurves.Curve) {
            const isChecked = fitters.has(entry.fitter)

            return c('input', {
              type: 'checkbox',
              checked: isChecked,
              click(_event: Event) {
                if (isChecked) {
                  disableFitter(entry.fitter)
                } else {
                  enableFitter(entry.fitter)
                }
              }
            })
          }
        } as ITableColumn,

        {
          label: 'TCurves.Curve name',
          class: 'col-name',
          value(entry: TCurves.Curve) {
            return c('span', {
              class: entry.cssClass,
              text: entry.fitter.name
            })
          }
        },

        {
          label: 'Expression',
          class: 'col-expression',
          value(entry: TCurves.Curve) {
            return String(entry.curve)
          }
        }
      ]
    })
  )
}
