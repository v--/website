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
import { GraphArc } from '../../common/math/graphs/graph.js'

/**
 * @typedef {{
   algorithm: string
   start: string
   end: string
  }} IQueryConfig
 */

/** @type {IQueryConfig} */
const QUERY_CONFIG_DEFAULTS = Object.freeze({
  algorithm: DEFAULT_ALGORITHM.id,
  start: '0',
  end: String(DEFAULT_ALGORITHM.graph.order - 1)
})

/**
 * @param {TRouter.IRouterState} state
 */
export function index({ path, description }) {
  /** @type {QueryConfig<IQueryConfig>} */
  const config = new QueryConfig(path, QUERY_CONFIG_DEFAULTS)
  const start = Number(config.get('start'))
  const end = Number(config.get('end'))
  const algorithmId = config.get('algorithm')

  const algorithm = first(filter(a => a.id === algorithmId, flatten(algorithms.map(section => section.algorithms))))
  const errors = []

  if (algorithm) {
    if (!Number.isInteger(start) || start < 0 || start >= algorithm.graph.order) {
      errors.push(`Invalid starting vertex ${start}.`)
    }

    if (!Number.isInteger(start) || end < 0 || end >= algorithm.graph.order) {
      errors.push(`Invalid end vertex ${end}.`)
    }
  } else {
    errors.push(`Cannot find algorithm ${repr(config.get('algorithm'))}.`)
  }

  /** @type {DictSubject<TGraphOpt.IGraphAlgorithmState<TNum.UInt32>>} */
  const subject = new DictSubject({
    algorithm: errors.length > 0 ? undefined : algorithm,
    graph: errors.length > 0 ? undefined : algorithm.graph,
    layout: errors.length > 0 ? undefined : algorithm.layout,
    result: errors.length > 0 ? undefined : algorithm.run(algorithm.graph, start, end),

    start,
    end,

    /**
     * @param {TNum.UInt32} [vertex]
     */
    hoverVertex(vertex) {
      subject.update({ hoveredVertex: vertex })
    },

    /**
     * @param {GraphArc<TNum.UInt32>} [arc]
     */
    hoverArc(arc) {
      subject.update({ hoveredArc: arc })
    },

    /**
     * @param {TNum.UInt32} [start]
     */
    changeStart(start) {
      location$.next(config.getUpdatedPath({ start: String(start) }))
    },

    /**
     * @param {TNum.UInt32} [end]
     */
    changeEnd(end) {
      location$.next(config.getUpdatedPath({ end: String(end) }))
    },

    /**
     * @param {TGraphOpt.IGraphAlgorithm<TNum.UInt32>} algorithm
     */
    runAlgorithm(algorithm) {
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
        c(graphCanvas, /** @type {TObservables.IObservable<TGraphOpt.ISuccessfulGraphAlgorithmState<TNum.UInt32>>} */ (subject)),
        c(graphDetails, /** @type {TObservables.IObservable<TGraphOpt.ISuccessfulGraphAlgorithmState<TNum.UInt32>>} */ (subject))
      )
    })
  )
}
