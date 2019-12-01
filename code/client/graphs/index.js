import { c } from '../../common/rendering/component.js'
import { aspectRatioBox } from '../core/components/aspect_ratio_box.js'
import { DictSubject } from '../../common/observables/dict_subject.js'

import { graphCanvas } from './components/graph_canvas.js'
import { graphDetails } from './components/graph_details.js'
import { algorithmDropdown } from './components/algorithm_dropdown.js'

import { DEFAULT_ALGORITHM } from './algorithms.js'

export function index () {
  const subject = new DictSubject({
    graph: null,
    result: null,
    layout: null,
    algorithm: null,

    hoveredVertex: null,
    hoveredArc: null,
    start: 0,

    hoverVertex (vertex) {
      subject.update({ hoveredVertex: vertex })
    },

    hoverArc (arc) {
      subject.update({ hoveredArc: arc })
    },

    changeStart (start) {
      subject.update({
        start,
        result: subject.value.algorithm.run(subject.value.graph, start)
      })
    },

    runAlgorithm (algorithm) {
      const graph = algorithm.graph

      subject.update({
        graph,
        result: algorithm.run(graph, subject.value.start),
        layout: algorithm.layout,
        algorithm
      })
    }
  })

  subject.value.runAlgorithm(DEFAULT_ALGORITHM)

  return c('div', { class: 'page playground-graphs-page' },
    c('div', { class: 'section' },
      c('h1', { class: 'section-title', text: 'Graph algorithm visualizations' }),
      c('p', { text: 'You can select another algorithm or pick a different starting point' })
    ),

    c(algorithmDropdown, subject),
    c(aspectRatioBox, {
      ratio: 13 / 10,
      bottomMargin: 25,
      minHeight: 250,
      maxHeight: 750,
      item: c('div', { class: 'graph-split-container' },
        c(graphCanvas, subject),
        c(graphDetails, subject)
      )
    })
  )
}
