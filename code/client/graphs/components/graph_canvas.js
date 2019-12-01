import { c } from '../../../common/rendering/component.js'
import { s } from '../../../common/support/svg.js'
import { classlist } from '../../../common/support/dom_properties.js'

import { arrowMarker } from './arrow_marker.js'

export function graphCanvas ({ graph, layout, result, hoverArc, hoverVertex, hoveredArc, hoveredVertex, changeStart, changeEnd }) {
  const highlightedArcs = new Set(result.subgraph.iterAllArcs())
  const highlightedVertices = new Set(result.subgraph.iterAllVertices())
  const arcData = []

  for (let u = 0; u < graph.order - 1; u++) {
    for (let v = u + 1; v < graph.order; v++) {
      const arc = graph.getArc(u, v)
      const dualArc = graph.getArc(v, u)
      const isEdge = arc !== null && dualArc !== null
      const isHovered = hoveredArc !== null && (hoveredArc === arc || hoveredArc === dualArc)
      const isHighlighted = highlightedArcs.has(arc) || highlightedArcs.has(dualArc)

      if (arc !== null) {
        arcData.push({ arc, isEdge, isHovered, isHighlighted })
      }

      if (dualArc !== null) {
        arcData.push({ arc: dualArc, isEdge, isHovered, isHighlighted })
      }
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
      c(arrowMarker, { id: 'triangle' }),
      c(arrowMarker, { id: 'triangle-accent' }),
      c(arrowMarker, { id: 'triangle-hovered' })
    ),

    ...arcData.map(function ({ arc, isEdge, isHovered, isHighlighted }) {
      const srcPos = layout[arc.src]
      const destPos = layout[arc.dest]

      const lineState = {
        class: 'arc-line',
        x1: String(srcPos.x),
        y1: String(srcPos.y),
        x2: String(destPos.x),
        y2: String(destPos.y)
      }

      if (!isEdge) {
        if (isHovered) {
          lineState['marker-end'] = 'url(#triangle-hovered)'
        } else if (isHighlighted) {
          lineState['marker-end'] = 'url(#triangle-accent)'
        } else {
          lineState['marker-end'] = 'url(#triangle)'
        }
      }

      return s('g',
        {
          class: classlist(
            'arc',
            isHighlighted && 'highlighted',
            isHovered && 'hovered'
          )
        },
        s('line', lineState),
        s('line', {
          class: 'arc-hover-line',
          x1: String(srcPos.x),
          y1: String(srcPos.y),
          x2: String(destPos.x),
          y2: String(destPos.y),
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
            result.start === v && 'path-start',
            result.end === v && 'path-end'
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
          },
          click (event) {
            if (event.ctrlKey) {
              if (result.end !== null) {
                changeEnd(v)
              }
            } else if (result.start !== null) {
              changeStart(v)
            }
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
