import { c } from '../../../common/rendering/component.js'
import { s } from '../../../common/support/svg.js'
import { classlist } from '../../../common/support/dom_properties.js'

import { FOREGROUND_COLOR, ACCENT_COLOR, HOVERED_COLOR } from '../../core/support/colors.js'
import { arrowMarker } from './arrow_marker.js'

export function graphCanvas ({ graph, layout, path, hoverArc, hoverVertex, hoveredArc, hoveredVertex }) {
  const arcs = graph.getAllArcs()
  const highlightedVertices = new Set(path)
  const highlightedArcs = new Set()

  for (let i = 1; i < path.length; i++) {
    highlightedArcs.add(graph.getArc(path[i - 1], path[i]))
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
      c(arrowMarker, { id: 'triangle-accent', fillColor: ACCENT_COLOR }),
      c(arrowMarker, { id: 'triangle-hovered', fillColor: HOVERED_COLOR })
    ),

    ...arcs.map(function (arc) {
      const src = layout[arc.src]
      const dest = layout[arc.dest]

      return s('g',
        {
          class: classlist(
            'edge',
            highlightedArcs.has(arc) && 'highlighted',
            hoveredArc === arc && 'hovered'
          )
        },
        s('line', {
          x1: String(src.x),
          y1: String(src.y),
          x2: String(dest.x),
          y2: String(dest.y),
          'marker-end': `url(#${hoveredArc === arc ? 'triangle-hovered' : highlightedArcs.has(arc) ? 'triangle-accent' : 'triangle'})`,
          mouseover (_event) {
            hoverArc(arc)
          },
          mouseleave (_event) {
            hoverArc(null)
          }
        })
      )
    }),

    ...layout.map(function ({ x, y }, v) {
      const hovered = hoveredVertex === v || (hoveredArc && (hoveredArc.src === v || hoveredArc.dest === v))

      return s('g',
        {
          class: classlist(
            'vertex',
            highlightedVertices.has(v) && 'highlighted',
            hovered && 'hovered'
          )
        },
        s('circle', {
          cx: String(x),
          cy: String(y),
          mouseover (_event) {
            hoverVertex(v)
          },
          mouseleave (_event) {
            hoverVertex(null)
          }
        }),

        s('text', {
          x: String(x),
          y: String(y),
          text: String(v)
        })
      )
    })
  )
}
