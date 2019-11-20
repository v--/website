import { c } from '../../common/rendering/component.js'
import { aspectRatioBox } from '../core/components/aspect_ratio_box.js'
import { DictSubject } from '../../common/observables/dict_subject.js'
import { map } from '../../common/support/iteration.js'

import { Graph, GraphArc } from '../../common/math/graphs/graph.js'
import { findShortestPath } from '../../common/math/graphs/dijsktra.js'
import { findUnitCircleLayout } from '../../common/math/graphs/layout.js'

import { graphCanvas } from './components/graph_canvas.js'
import { graphLegend } from './components/graph_legend.js'
import { info } from './components/info.js'

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
  const { path, cumWeights } = findShortestPath(graph, 0, 9)

  const subject = new DictSubject({
    graph,
    path,
    data: new Map(map(([k, v]) => [k, { cumWeight: v }], cumWeights.entries())),
    layout: findUnitCircleLayout(graph),
    hoveredVertex: null,
    hoveredArc: null,
    hoverVertex (vertex) {
      subject.update({ hoveredVertex: vertex })
    },
    hoverArc (arc) {
      subject.update({ hoveredArc: arc })
    }
  })

  return c('div', { class: 'page playground-graphs-page' },
    c('div', { class: 'section' },
      c('h1', { class: 'section-title', text: 'Graph algorithm visualizations' }),
      c('p', {
        class: 'graphs-subtitle',
        text: 'Use the controls below to switch between different algorithms.'
      })
    ),

    c('div', { class: 'graph-split-container' },
      c('div', { class: 'graph-canvas-container' },
        c(aspectRatioBox, {
          ratio: 1,
          bottomMargin: 100,
          minHeight: 250,
          maxHeight: 500,
          item: c(graphCanvas, subject)
        })
      ),

      c(info, subject)
    ),

    c(graphLegend, subject)
  )
}
