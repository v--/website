import { c } from '../../../common/rendering/component.js'
import { s } from '../../../common/support/svg.js'
import { isSameNumber } from '../../../common/support/numeric.js'
import { classlist } from '../../../common/support/dom_properties.js'
import { FOREGROUND_COLOR, ACCENT_COLOR } from '../../core/support/colors.js'

import { eigen } from '../../core/math/linalg/eigen.js'

import arrowMarker from './arrow_marker.js'

function calculateViewBox (vertices) {
  const minX = Math.min(...vertices.map(({ x }) => x))
  const maxX = Math.max(...vertices.map(({ x }) => x))
  const minY = Math.min(...vertices.map(({ y }) => y))
  const maxY = Math.max(...vertices.map(({ y }) => y))

  const width = maxX - minX
  const height = maxY - minY
  const side = Math.max(width, height)
  const offset = side / 3

  return [
    minX - offset,
    minY - offset,
    side + 2 * offset,
    side + 2 * offset
  ].join(' ')
}

function findOverlappingVertices (vertices) {
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      if (isSameNumber(vertices[i].x, vertices[j].x) && isSameNumber(vertices[i].y, vertices[j].y)) {
        return [i, j]
      }
    }
  }

  return null
}

function findNewPosition (vertices, j) {
  const max = Math.max(
    ...vertices.map(({ x }) => x),
    ...vertices.map(({ y }) => y)
  )

  const radius = 2 * max
  const angle = 2 * Math.PI * (j / vertices.length)

  return {
    x: radius * Math.cos(angle),
    y: radius * Math.sin(angle)
  }
}

function moveOverlappingVertices (vertices) {
  const result = vertices.slice()
  let overlapping = findOverlappingVertices(result)
  let it = 0

  while (overlapping !== null && it < 10) {
    const [, j] = overlapping
    result[j] = findNewPosition(vertices, j)
    overlapping = findOverlappingVertices(result)
    it++
  }

  return result
}

export default function graphCanvas ({ graph }) {
  let vertices = eigen(graph.getSymmetrizedLaplacian())
    .l
    .toRows()
    .map(array => ({
      x: array[0],
      y: array[1]
    }))

  vertices = moveOverlappingVertices(vertices)

  const edges = graph.getEdges()

  return s(
    'svg',
    {
      class: 'graph-canvas',
      viewBox: calculateViewBox(vertices)
    },
    s(
      'defs',
      null,
      c(arrowMarker, { id: 'triangle', fillColor: FOREGROUND_COLOR }),
      c(arrowMarker, { id: 'triangle-accent', fillColor: ACCENT_COLOR })
    ),

    ...edges.map(function ({ from, to, directed }) {
      const highlighted = graph.highlighted.has(from) && graph.highlighted.has(to)

      const state = {
        class: classlist('edge', highlighted && 'highlighted'),
        x1: String(vertices[from].x),
        y1: String(vertices[from].y),
        x2: String(vertices[to].x),
        y2: String(vertices[to].y)
      }

      if (directed) {
        const id = highlighted ? 'triangle-accent' : 'triangle'
        state['marker-end'] = `url(#${id})`
      }

      return s('line', state)
    }),

    ...vertices.map(function ({ x, y }, i) {
      const highlighted = graph.highlighted.has(i)

      return s('circle', {
        class: classlist('vertex', highlighted && 'highlighted'),
        cx: String(x),
        cy: String(y)
      })
    })
  )
}
