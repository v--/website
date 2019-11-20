import { c } from '../../../common/rendering/component.js'
import { s } from '../../../common/support/svg.js'
import { classlist } from '../../../common/support/dom_properties.js'

import { FOREGROUND_COLOR, ACCENT_COLOR } from '../../core/support/colors.js'
import { arrowMarker } from './arrow_marker.js'

export function graphCanvas ({ graph, layout }) {
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

      const src = layout[arc.src]
      const dest = layout[arc.dest]

      return s('g', { class: classlist('edge', highlighted && 'highlighted') },
        s('line', {
          x1: String(src.x),
          y1: String(src.y),
          x2: String(dest.x),
          y2: String(dest.y),
          'marker-end': `url(#${highlighted ? 'triangle-accent' : 'triangle'})`
        })
      )
    }),

    ...layout.map(function ({ x, y }, i) {
      return s('g', { class: classlist('vertex', highlightedVertices.has(i) && 'highlighted') },
        s('circle', {
          cx: String(x),
          cy: String(y)
        }),

        s('text', {
          x: String(x),
          y: String(y),
          text: String(i)
        })
      )
    })
  )
}
