import { c } from '../../../common/rendering/component.js'
import { empty, map } from '../../../common/support/iteration.js'

function stringifyDatum (datum) {
  if (datum === null) {
    return empty()
  }

  return map(function ({ label, value }) {
    return c('div', { class: 'card' },
      c('div', { class: 'card-title', text: label }),
      c('div', { class: 'card-body', text: String(value) })
    )
  }, datum)
}

export function graphDetails ({ hoveredVertex, hoveredArc, result }) {
  if (hoveredVertex !== null) {
    const datum = result.vertexData.get(hoveredVertex) || null
    let name = String(hoveredVertex)

    if (result.start === hoveredVertex) {
      name += ' (start)'
    }

    if (result.end === hoveredVertex) {
      name += ' (end)'
    }

    return c('div', { class: 'graph-details' },
      c('div', { class: 'card' },
        c('div', { class: 'card-title', text: 'Vertex' }),
        c('div', { class: 'card-body', text: name })
      ),

      ...stringifyDatum(datum)
    )
  }

  if (hoveredArc !== null) {
    const datum = result.arcData.get(hoveredArc) || null

    return c('div', { class: 'graph-details' },
      c('div', { class: 'card' },
        c('div', { class: 'card-title', text: 'Arc' }),
        c('div', { class: 'card-body', text: `(${hoveredArc.src}, ${hoveredArc.dest})` })
      ),

      ...stringifyDatum(datum)
    )
  }

  return c('div', { class: 'graph-details' },
    c('p', { text: 'Hover over any vertex or arc to show associated information.' })
  )
}
