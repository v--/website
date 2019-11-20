import { c } from '../../common/rendering/component.js'
import { aspectRatioPage, aspectRatioBox } from '../core/components/aspect_ratio_page.js'
import { DictSubject } from '../../common/observables/dict_subject.js'

import { Graph, GraphArc } from '../../common/math/graphs/graph.js'
import { highlightShortestPath } from '../../common/math/graphs/dijsktra.js'
import { findUnitSquareLayout } from '../../common/math/graphs/layout.js'

import { graphCanvas } from './components/graph_canvas.js'

const DEFAULT_ARCS = [
  { src: 0, dest: 1, weight: 1 },
  { src: 0, dest: 2, weight: 2 },
  { src: 1, dest: 3, weight: 2 },
  { src: 1, dest: 5, weight: 1 },
  { src: 2, dest: 4, weight: 3 },
  { src: 2, dest: 6, weight: 2 },
  { src: 3, dest: 9, weight: 1 },
  { src: 4, dest: 7, weight: 2 },
  { src: 4, dest: 9, weight: 1 },
  { src: 5, dest: 9, weight: 3 },
  { src: 6, dest: 4, weight: 2 },
  { src: 6, dest: 7, weight: 3 },
  { src: 8, dest: 7, weight: 5 }
]

export function index () {
  const arcs = DEFAULT_ARCS.map(arcData => new GraphArc(arcData))
  const graph = Graph.fromArcs(arcs).clone()
  const layout = findUnitSquareLayout(graph)
  highlightShortestPath(graph, 0, 9)

  const subject = new DictSubject({ graph, layout })

  return c(aspectRatioPage, { class: 'page playground-graphs-page' },
    c('div', { class: 'section' },
      c('h1', { class: 'section-title', text: '[WIP] Graph optimization algorithm visualizations' })
    ),

    c(aspectRatioBox, {
      ratio: 1,
      bottomMargin: 25,
      minHeight: 250,
      maxHeight: 500,
      item: c(graphCanvas, subject)
    })
  )
}
