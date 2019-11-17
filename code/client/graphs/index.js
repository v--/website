import { c } from '../../common/rendering/component.js'
import { aspectRatioPage, aspectRatioBox } from '../core/components/aspect_ratio_page.js'
import { DictSubject } from '../../common/observables/dict_subject.js'

import { Graph } from '../../common/math/graphs/graph.js'
import { highlightShortestPath } from '../../common/math/graphs/dijsktra.js'

import { graphCanvas } from './components/graph_canvas.js'

export function index () {
  const graph = Graph.fromArcs([
    { label: 'a', src: 0, dest: 1, weight: 2 },
    { label: 'b', src: 0, dest: 2, weight: 2 },
    { label: 'c', src: 0, dest: 5, weight: 10 },
    { label: 'd', src: 1, dest: 3, weight: 2 },
    { label: 'e', src: 2, dest: 4, weight: 3 },
    { label: 'f', src: 3, dest: 5, weight: 1 },
    { label: 'g', src: 4, dest: 5, weight: 1 }
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
