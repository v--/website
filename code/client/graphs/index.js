import { c } from '../../common/rendering/component.js'
import { aspectRatioBox } from '../core/components/aspect_ratio_box.js'
import { DictSubject } from '../../common/observables/dict_subject.js'

import { graphCanvas } from './components/graph_canvas.js'
import { graphDetails } from './components/graph_details.js'
import { algorithmDropdown } from './components/algorithm_dropdown.js'

import { algorithms } from './algorithms.js'

const DEFAULT_ALGORITHM = algorithms[0].algorithms[0]

export function index () {
  const subject = new DictSubject({
    graph: null,
    result: null,
    layout: null,
    algorithm: null,

    hoveredVertex: null,
    hoveredArc: null,

    hoverVertex (vertex) {
      subject.update({ hoveredVertex: vertex })
    },

    hoverArc (arc) {
      subject.update({ hoveredArc: arc })
    },

    runAlgorithm (algorithm) {
      const graph = algorithm.graph

      subject.update({
        graph,
        result: algorithm.run(graph),
        layout: algorithm.getLayout(graph),
        algorithm
      })
    }
  })

  subject.value.runAlgorithm(DEFAULT_ALGORITHM)

  return c('div', { class: 'page playground-graphs-page' },
    c('div', { class: 'section' },
      c('h1', { class: 'section-title', text: 'Graph algorithm visualizations' }),
      c('p', {
        class: 'graphs-subtitle',
        text: 'Use the dropdown below to switch between different algorithms.'
      })
    ),

    c(aspectRatioBox, {
      ratio: 5 / 4,
      bottomMargin: 50,
      minWidth: 500,
      maxWidth: 700,
      item: c('div', { class: 'graph-split-container' },
        c(graphCanvas, subject),
        c(graphDetails, subject)
      )
    }),

    c(algorithmDropdown, subject)
  )
}
