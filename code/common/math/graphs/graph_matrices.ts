import { Matrix } from '../linalg/matrix.js'
import { Graph } from './graph.js'

export function adjacencyMatrix(graph: Graph<Num.UInt32>) {
  const result = Matrix.zero(graph.order, graph.order)

  for (const arc of graph.iterAllArcs()) {
    result.set(arc.src, arc.dest, 1)
  }

  return result
}

export function pathLengthMatrix(graph: Graph<Num.UInt32>) {
  const result = Matrix.fill(Number.POSITIVE_INFINITY, graph.order)

  for (const arc of graph.iterAllArcs()) {
    result.set(arc.src, arc.dest, arc.weight)
  }

  return result
}
