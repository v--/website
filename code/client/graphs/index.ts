import { c } from '../../common/rendering/component.js'
import { repr } from '../../common/support/strings.js'
import { filter, first, flatten } from '../../common/support/iteration.js'
import { aspectRatioBox } from '../core/components/aspect_ratio_box.js'
import { DictSubject } from '../../common/observables/dict_subject.js'
import { sectionTitle } from '../../common/components/section_title.js'

import { graphCanvas } from './components/graph_canvas.js'
import { graphDetails } from './components/graph_details.js'
import { algorithmDropdown } from './components/algorithm_dropdown.js'

import { algorithms, DEFAULT_ALGORITHM } from './algorithms.js'

import { QueryConfig } from '../../common/support/query_config.js'
import { location$ } from '../../common/shared_observables.js'
import { RouterState } from '../../common/support/router_state.js'
import { GraphAlgorithm, GraphAlgorithmId } from './types/graph_algorithm.js'
import { GraphAlgorithmState, SuccessfulGraphAlgorithmState } from './types/state.js'
import { GraphArc } from '../../common/math/graphs/graph.js'
import { IObservable } from '../../common/observables/observable.js'
import { uint32 } from '../../common/types/numeric.js'

interface IQueryConfig {
  algorithm: GraphAlgorithmId
  start: uint32
  end: uint32
}

const QUERY_CONFIG_DEFAULTS: IQueryConfig = Object.freeze({
  algorithm: DEFAULT_ALGORITHM.id,
  start: 0,
  end: DEFAULT_ALGORITHM.graph.order - 1
})

const QUERY_CONFIG_PARSERS = Object.freeze({
  algorithm: String,
  start: Number,
  end: Number
})

export function index({ path, description }: RouterState) {
  const config = new QueryConfig(path, QUERY_CONFIG_DEFAULTS, QUERY_CONFIG_PARSERS)
  const start = config.get('start') as uint32
  const end = config.get('end') as uint32
  const algorithmId = config.get('algorithm')

  const algorithm = first(filter(a => a.id === algorithmId, flatten(algorithms.map(section => section.algorithms))))
  const errors = []

  if (algorithm) {
    if (start < 0 || start >= algorithm.graph.order) {
      errors.push(`Invalid starting vertex ${start}.`)
    }

    if (end < 0 || end >= algorithm.graph.order) {
      errors.push(`Invalid end vertex ${end}.`)
    }
  } else {
    errors.push(`Cannot find algorithm ${repr(config.get('algorithm'))}.`)
  }

  const subject = new DictSubject<GraphAlgorithmState<uint32>>({
    algorithm: errors.length > 0 ? undefined : algorithm,
    graph: errors.length > 0 ? undefined : algorithm.graph,
    layout: errors.length > 0 ? undefined : algorithm.layout,
    result: errors.length > 0 ? undefined : algorithm.run(algorithm.graph, start, end),

    start,
    end,

    hoverVertex(vertex?: uint32) {
      subject.update({ hoveredVertex: vertex })
    },

    hoverArc(arc?: GraphArc<uint32>) {
      subject.update({ hoveredArc: arc })
    },

    changeStart(start?: uint32) {
      location$.next(config.getUpdatedPath({ start }))
    },

    changeEnd(end?: uint32) {
      location$.next(config.getUpdatedPath({ end }))
    },

    runAlgorithm(algorithm: GraphAlgorithm<uint32>) {
      location$.next(config.getUpdatedPath({ algorithm: algorithm.id }))
    }
  })

  return c('div', { class: 'page playground-graphs-page' },
    c(sectionTitle, { text: description, path }),
    c('p', { text: 'For the algorithms that requires endpoints:' }),
    c('ul', undefined,
      c('li', { text: 'Starting vertices are marked in green and can be changed by clicking a vertex' }),
      c('li', { text: 'End vertices are marked in yellow and can be changed by ctrl-clicking a vertex' })
    ),
    c(algorithmDropdown, subject),

    errors.length > 0 && c('p', { class: 'graphs-error', text: errors.join('\n') }),
    errors.length === 0 && c(aspectRatioBox, {
      ratio: 14 / 10,
      bottomMargin: 30,
      minHeight: 250,
      maxHeight: 750,
      item: c('div', { class: 'graph-split-container' },
        c(graphCanvas, subject as IObservable<SuccessfulGraphAlgorithmState<uint32>>),
        c(graphDetails, subject as IObservable<SuccessfulGraphAlgorithmState<uint32>>)
      )
    })
  )
}
