import { GraphArc } from '../../../common/math/graphs/graph.js'
import { c } from '../../../common/rendering/component.js'
import { map } from '../../../common/support/iteration.js'
import { GraphAlgorithmResult } from '../support/algorithm_result.js'
import { GraphAlgorithmDatum } from '../types/algorithm_data.js'
import { SuccessfulGraphAlgorithmState } from '../types/state.js'

function stringifyDatum({ label, value }: GraphAlgorithmDatum) {
  return c('div', { class: 'card' },
    c('div', { class: 'card-title', text: label }),
    c('div', { class: 'card-body', text: value })
  )
}

export function hoveredDetails<T>({ hoveredVertex, hoveredArc, result }: {
  hoveredVertex?: T,
  hoveredArc?: GraphArc<T>,
  result: GraphAlgorithmResult<T>
}) {
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

      datum && stringifyDatum(datum)
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

export function graphDetails<T>({ hoveredVertex, hoveredArc, result }: SuccessfulGraphAlgorithmState<T>) {
  return c('div', { class: 'graph-details' },
    ...map(stringifyDatum, result.summary),
    result.summary.length > 0 && c('hr', { class: 'graph-details-ruler' }),
    c(hoveredDetails, { hoveredVertex, hoveredArc, result })
  )
}
