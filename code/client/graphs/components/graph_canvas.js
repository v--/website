import { c } from '../../../common/rendering/component.js'
import { s } from '../../../common/support/svg.js'
import { classlist } from '../../../common/support/dom_properties.js'

import { arrowMarker } from './arrow_marker.js'

export function graphCanvas ({ graph, layout, result, hoverArc, hoverVertex, hoveredArc, hoveredVertex }) {
  const arcs = graph.getAllArcs()
  const highlightedVertices = new Set(result.path)
  const highlightedArcs = new Set()

  for (let i = 1; i < result.path.length; i++) {
    highlightedArcs.add(graph.getArc(result.path[i - 1], result.path[i]))
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
      c(arrowMarker, { id: 'triangle' }),
      c(arrowMarker, { id: 'triangle-accent' }),
      c(arrowMarker, { id: 'triangle-hovered' })
    ),

    ...arcs.map(function (arc) {
      const src = layout[arc.src]
      const dest = layout[arc.dest]

      return s('g',
        {
          class: classlist(
            'arc',
            highlightedArcs.has(arc) && 'highlighted',
            hoveredArc === arc && 'hovered'
          )
        },
        s('line', {
          class: 'arc-line',
          x1: String(src.x),
          y1: String(src.y),
          x2: String(dest.x),
          y2: String(dest.y),
          'marker-end': `url(#${hoveredArc === arc ? 'triangle-hovered' : highlightedArcs.has(arc) ? 'triangle-accent' : 'triangle'})`
        }),
        s('line', {
          class: 'arc-hover-line',
          x1: String(src.x),
          y1: String(src.y),
          x2: String(dest.x),
          y2: String(dest.y),
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
            hovered && 'hovered',
            result.path[0] === v && 'path-start',
            result.path[result.path.length - 1] === v && 'path-end'
          )
        },
        s('circle', {
          class: 'vertex-circle',
          cx: String(x),
          cy: String(y),
          r: '0.1',
          mouseover (_event) {
            hoverVertex(v)
          },
          mouseleave (_event) {
            hoverVertex(null)
          }
        }),

        s('text', {
          class: 'vertex-text',
          x: String(x),
          y: String(y),
          text: String(v)
        })
      )
    })
  )
}
