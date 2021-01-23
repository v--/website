import { Matrix } from '../linalg/matrix.js'
import { Graph } from './graph.js'

/** @param {Graph<TNum.UInt32>} graph */
export function adjacencyMatrix(graph) {
  const result = Matrix.zero(graph.order, graph.order)

  for (const arc of graph.iterAllArcs()) {
    result.set(arc.src, arc.dest, 1)
  }

  return result
}

/** @param {Graph<TNum.UInt32>} graph */
export function pathLengthMatrix(graph) {
  const result = Matrix.fill(Number.POSITIVE_INFINITY, graph.order)

  for (const arc of graph.iterAllArcs()) {
    result.set(arc.src, arc.dest, arc.weight)
  }

  return result
}
