import { c } from '../../../common/rendering/component.js'

export function graphLegend () {
  return c('div', { class: 'graph-legend' },
    c('h1', { class: 'section-title legend-title', text: 'Legend' })
  )
}
