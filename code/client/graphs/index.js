import { c } from '../../common/rendering/component.js'
import { repr } from '../../common/support/strings.js'
import { filter, flatten } from '../../common/support/iteration.js'
import { aspectRatioBox } from '../core/components/aspect_ratio_box.js'
import { DictSubject } from '../../common/observables/dict_subject.js'
import { sectionTitle } from '../../common/components/section_title.js'

import { graphCanvas } from './components/graph_canvas.js'
import { graphDetails } from './components/graph_details.js'
import { algorithmDropdown } from './components/algorithm_dropdown.js'

import { algorithms, DEFAULT_ALGORITHM } from './algorithms.js'

import { QueryConfig } from '../../common/support/query_config.js'
import { location$ } from '../../common/shared_observables.js'

const QUERY_CONFIG_DEFAULTS = Object.freeze({
  algorithm: DEFAULT_ALGORITHM.id,
  start: 0,
  end: DEFAULT_ALGORITHM.graph.order - 1
})

const QUERY_CONFIG_PARSERS = Object.freeze({
  algorithm: String,
  start: Number,
  end: Number
})

export function index ({ path }) {
  const config = new QueryConfig(path, QUERY_CONFIG_DEFAULTS, QUERY_CONFIG_PARSERS)
  const start = config.get('start')
  const end = config.get('end')
  const algorithmId = config.get('algorithm')

  const algorithm = filter(a => a.id === algorithmId, flatten(algorithms.map(section => section.algorithms))).next().value || null
  const errors = []

  if (algorithm === null) {
    errors.push(`Cannot find algorithm ${repr(config.get('algorithm'))}.`)
  } else {
    if (start < 0 || start >= algorithm.graph.order) {
      errors.push(`Invalid starting vertex ${start}.`)
    }

    if (end < 0 || end >= algorithm.graph.order) {
      errors.push(`Invalid end vertex ${end}.`)
    }
  }

  const subject = new DictSubject({
    algorithm: errors.length > 0 ? null : algorithm,
    graph: errors.length > 0 ? null : algorithm.graph,
    layout: errors.length > 0 ? null : algorithm.layout,
    result: errors.length > 0 ? null : algorithm.run(algorithm.graph, start, end),

    hoveredVertex: null,
    hoveredArc: null,

    start,
    end,

    hoverVertex (vertex) {
      subject.update({ hoveredVertex: vertex })
    },

    hoverArc (arc) {
      subject.update({ hoveredArc: arc })
    },

    changeStart (start) {
      location$.next(config.getUpdatedPath({ start }))
    },

    changeEnd (end) {
      location$.next(config.getUpdatedPath({ end }))
    },

    runAlgorithm (algorithm) {
      location$.next(config.getUpdatedPath({ algorithm: algorithm.id }))
    }
  })

  return c('div', { class: 'page playground-graphs-page' },
    c(sectionTitle, { text: 'Graph algorithm visualizations', path }),
    c('p', { text: 'You can select algorithms from the dropdown or pick path endpoints by clicking or ctrl-clicking a vertex. Note that not all algorithms require path endpoints.' }),
    c(algorithmDropdown, subject),

    errors.length > 0 && c('p', { class: 'graphs-error', text: errors.join('\n') }),
    errors.length === 0 && c(aspectRatioBox, {
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
