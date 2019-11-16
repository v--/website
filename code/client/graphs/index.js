import { c } from '../../common/rendering/component.js'
import { aspectRatioPage, aspectRatioBox } from '../core/components/aspect_ratio_page.js'
import { DictSubject } from '../../common/observables/dict_subject.js'

import { Graph } from '../core/math/graphs/graph.js'
import { highlightShortestPath } from '../core/math/graphs/dijsktra.js'

import { graphCanvas } from './components/graph_canvas.js'

export function index () {
  const graph = Graph.fromArcs([
    { src: 0, dest: 1, weight: 2 },
    { src: 0, dest: 2, weight: 2 },
    { src: 0, dest: 5, weight: 10 },
    { src: 1, dest: 3, weight: 2 },
    { src: 2, dest: 4, weight: 3 },
    { src: 3, dest: 5, weight: 1 },
    { src: 4, dest: 5, weight: 1 }
  ])

  highlightShortestPath(graph, 0, 5)

  const subject = new DictSubject({ graph })

  return c(aspectRatioPage, { class: 'page playground-graphs-page' },
    c('div', { class: 'section' },
      c('h1', { class: 'section-title', text: '[WIP] Graph optimization algorithm visualizations' })
    ),

    c(aspectRatioBox, {
      ratio: 1,
      bottomMargin: 25,
      minHeight: 250,
      maxHeight: 700,
      item: c(graphCanvas, subject)
    })
  )
}
