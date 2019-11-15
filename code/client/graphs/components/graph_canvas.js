import { c } from '../../../common/rendering/component.js'
import { s } from '../../../common/support/svg.js'
import { classlist } from '../../../common/support/dom_properties.js'
import { FOREGROUND_COLOR, ACCENT_COLOR } from '../../core/support/colors.js'

import arrowMarker from './arrow_marker.js'

export default function graphCanvas ({ graph }) {
  const vertexCoords = []

  for (let i = 0; i < graph.order; i++) {
    const angle = 2 * Math.PI * (i / graph.order)
    vertexCoords.push({
      x: Math.cos(angle),
      y: Math.sin(angle)
    })
  }

  const arcs = graph.getAllArcs()
  const highlightedVertices = new Set()

  for (const arc of arcs) {
    if (arc.highlighted) {
      highlightedVertices.add(arc.src)
      highlightedVertices.add(arc.dest)
    }
  }

  return s(
    'svg',
    {
      class: 'graph-canvas',
      viewBox: '-1.5 -1.5 3 3'
    },
    s(
      'defs',
      null,
      c(arrowMarker, { id: 'triangle', fillColor: FOREGROUND_COLOR }),
      c(arrowMarker, { id: 'triangle-accent', fillColor: ACCENT_COLOR })
    ),

    ...arcs.map(function (arc) {
      const highlighted = arc.highlighted

      const src = vertexCoords[arc.src]
      const dest = vertexCoords[arc.dest]
      const center = {
        x: (src.x + dest.x) / 2,
        y: (src.y + dest.y) / 2
      }

      return s('g', { class: classlist('edge', highlighted && 'highlighted') },
        s('line', {
          x1: String(src.x),
          y1: String(src.y),
          x2: String(dest.x),
          y2: String(dest.y),
          'marker-end': `url(#${highlighted ? 'triangle-accent' : 'triangle'})`
        }),
        s('circle', {
          cx: String(center.x),
          cy: String(center.y)
        }),
        s('text', {
          x: String(center.x),
          y: String(center.y + 0.035),
          text: arc.weight
        })
      )
    }),

    ...vertexCoords.map(function ({ x, y }, i) {
      return s('g', { class: classlist('vertex', highlightedVertices.has(i) && 'highlighted') },
        s('circle', {
          cx: String(x),
          cy: String(y)
        }),

        s('text', {
          x: String(x),
          y: String(y + 0.035),
          text: String(i)
        })
      )
    })
  )
}
