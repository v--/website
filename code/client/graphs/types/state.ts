import { Graph, GraphArc } from '../../../common/math/graphs/graph.js'
import { GraphLayout } from '../../../common/math/graphs/types/layout.js'
import { GraphAlgorithmResult } from '../support/algorithm_result.js'
import { GraphAlgorithm } from './graph_algorithm.js'

export interface GraphAlgorithmState<T> {
  algorithm?: GraphAlgorithm<T>,
  graph?: Graph<T>,
  layout?: GraphLayout<T>
  result?: GraphAlgorithmResult<T>,

  hoveredVertex?: T,
  hoveredArc?: GraphArc<T>,

  start?: T,
  end?: T,

  hoverVertex: (vertex?: T) => void
  hoverArc: (arc?: GraphArc<T>) => void

  changeStart: (vertex?: T) => void
  changeEnd: (vertex?: T) => void

  runAlgorithm: TCons.Action<GraphAlgorithm<T>>
}

export type SuccessfulGraphAlgorithmState<T> = TCons.RequiredWith<
  GraphAlgorithmState<T>,
  'algorithm' | 'graph' | 'layout' | 'result'
>
