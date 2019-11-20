import { c } from '../../../common/rendering/component.js'

export function info ({ hoveredVertex, hoveredArc, data }) {
  let nameString = null
  let weightString = null
  let datumString = null

  if (hoveredVertex !== null) {
    nameString = String(hoveredVertex)

    if (data.has(hoveredVertex)) {
      datumString = JSON.stringify(data.get(hoveredVertex), null, 4)
    }
  }

  if (hoveredArc !== null) {
    nameString = `(${hoveredArc.src}, ${hoveredArc.dest})`
    weightString = String(hoveredArc.weight)

    if (data.has(hoveredArc)) {
      datumString = JSON.stringify(data.get(hoveredArc), null, 4)
    }
  }

  return c('div', { class: 'arc-info' },
    c('div', { class: 'arc-details' },
      c('div', { class: 'card' },
        c('div', { class: 'card-title', text: 'Name' }),
        c('div', { class: 'card-body', text: nameString || 'Highlight any vertex or arc' })
      ),

      c('div', { class: 'card' },
        c('div', { class: 'card-title', text: 'Weight' }),
        c('div', { class: 'card-body', text: weightString || '—' })
      ),

      c('div', { class: 'card' },
        c('div', { class: 'card-title', text: 'Data' }),
        c('div', { class: 'card-body', text: datumString || '—' })
      )
    )
  )
}
