import { Graph } from '../../../common/math/graphs/graph.js'
import { RequiredWith } from '../../../common/types/typecons.js'
import { GraphAlgorithmArcData } from './arc_data.js'
import { GraphAlgorithmSummary } from './summary.js'
import { GraphAlgorithmVertexData } from './vertex_data.js'

export interface GraphAlgorithmResultParams<T> {
  subgraph: Graph<T>
  vertexData: GraphAlgorithmVertexData<T>
  arcData: GraphAlgorithmArcData<T>
  summary?: GraphAlgorithmSummary,
  start?: T,
  end?: T
}

export interface GraphAlgorithmResult<T> extends RequiredWith<GraphAlgorithmResultParams<T>, 'summary'> {}
export class GraphAlgorithmResult<T> {
  constructor(params: GraphAlgorithmResultParams<T>) {
    Object.assign(this, { summary: [] }, params)
  }
}
