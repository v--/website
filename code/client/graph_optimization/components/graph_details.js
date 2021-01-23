import { GraphArc } from '../../../common/math/graphs/graph.js'
import { c } from '../../../common/rendering/component.js'
import { map } from '../../../common/support/iteration.js'

/**
 * @param {TGraphOpt.IGraphAlgorithmDatum} state
 */
function stringifyDatum({ label, value }) {
  return c('div', { class: 'card' },
    c('div', { class: 'card-title', text: label }),
    c('div', { class: 'card-body', text: value })
  )
}

/**
 * @template T
 * @param {{
 *   hoveredVertex?: T,
 *   hoveredArc?: GraphArc<T>,
 *   result: TGraphOpt.IGraphAlgorithmResult<T>
 * }} state
 */
export function hoveredDetails({ hoveredVertex, hoveredArc, result }) {
  if (hoveredVertex) {
    const datum = result.vertexData.get(hoveredVertex)
    let name = String(hoveredVertex)

    if (result.start === hoveredVertex) {
      name += ' (start)'
    }

    if (result.end === hoveredVertex) {
      name += ' (end)'
    }

    return c('div', { class: 'graph-hovered-details' },
      c('div', { class: 'card' },
        c('div', { class: 'card-title', text: 'Vertex' }),
        c('div', { class: 'card-body', text: name })
      ),

      ...map(stringifyDatum, datum || [])
    )
  }

  if (hoveredArc) {
    const datum = result.arcData.get(hoveredArc) 

    return c('div', { class: 'graph-hovered-details' },
      c('div', { class: 'card' },
        c('div', { class: 'card-title', text: 'Arc' }),
        c('div', { class: 'card-body', text: `(${hoveredArc.src}, ${hoveredArc.dest})` })
      ),

      datum && stringifyDatum(datum)
    )
  }

  return c('div', { class: 'graph-hovered-details' },
    c('p', { text: 'Hover over any vertex or arc to show associated information.' })
  )
}

/**
 * @template T
 * @param {TGraphOpt.ISuccessfulGraphAlgorithmState<T>} state
 */
export function graphDetails({ hoveredVertex, hoveredArc, result }) {
  const summary = result.summary || []

  return c('div', { class: 'graph-details' },
    ...map(stringifyDatum, summary),
    summary.length > 0 && c('hr', { class: 'graph-details-ruler' }),
    c(hoveredDetails, { hoveredVertex, hoveredArc, result })
  )
}
