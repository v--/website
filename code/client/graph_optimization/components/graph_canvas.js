import { c } from '../../../common/rendering/component.js'
import { s } from '../../../common/support/svg.js'
import { classlist } from '../../../common/support/dom_properties.js'

import { arrowMarker } from './arrow_marker.js'
import { GraphArc } from '../../../common/math/graphs/graph.js'
import { map } from '../../../common/support/iteration.js'

/**
 * @typedef {{
 *   arc: GraphArc<TNum.UInt32>
 *   isEdge: boolean
 *   isHovered: boolean
 *   isHighlighted: boolean
 * }} ArcDatum
 */

/**
 * @param {TGraphOpt.ISuccessfulGraphAlgorithmState<TNum.UInt32>} state
 */
export function graphCanvas({ graph, layout, result, hoverArc, hoverVertex, hoveredArc, hoveredVertex, changeStart, changeEnd }) {
  const highlightedArcs = new Set(result.subgraph.iterAllArcs())
  const highlightedVertices = new Set(result.subgraph.iterAllVertices())
  /** @type {Array<ArcDatum>} */
  const arcData = []

  for (let u = 0; u < graph.order - 1; u++) {
    for (let v = u + 1; v < graph.order; v++) {
      const arc = graph.getArc(u, v)
      const dualArc = graph.getArc(v, u)
      const isEdge = arc !== undefined && dualArc !== undefined
      const isHovered = hoveredArc !== undefined && (hoveredArc === arc || hoveredArc === dualArc)
      const isHighlighted = (arc !== undefined && highlightedArcs.has(arc)) || 
        (dualArc !== undefined && highlightedArcs.has(dualArc))

      if (arc) {
        arcData.push({ arc, isEdge, isHovered, isHighlighted })
      }

      if (dualArc) {
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
      undefined,
      c(arrowMarker, { id: 'triangle' }),
      c(arrowMarker, { id: 'triangle-accent' }),
      c(arrowMarker, { id: 'triangle-hovered' })
    ),

    ...arcData.map(function({ arc, isEdge, isHovered, isHighlighted }) {
      const srcPos = layout.get(arc.src)
      const destPos = layout.get(arc.dest)

      /** @type {{
       *   class: string,
       *   x1: string,
       *   y1: string,
       *   x2: string,
       *   y2: string
       *   'marker-end'?: string
       * }} */
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
          /** @param {MouseEvent} _event */
          mouseover(_event) {
            hoverArc(arc)
          },
          /** @param {MouseEvent} _event */
          mouseleave(_event) {
            hoverArc()
          }
        })
      )
    }),

    ...map(([v, { x, y }]) => {
      const hovered = hoveredVertex === v || (hoveredArc !== undefined && (hoveredArc.src === v || hoveredArc.dest === v))

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
          /** @param {MouseEvent} _event */
          mouseover(_event) {
            hoverVertex(v)
          },
          /** @param {MouseEvent} _event */
          mouseleave(_event) {
            hoverVertex()
          },
          /** @param {MouseEvent} event */
          click(event) {
            if (event.ctrlKey) {
              if (result.end !== undefined) {
                changeEnd(v)
              }
            } else if (result.start !== undefined) {
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
    }, layout.entries())
  )
}
