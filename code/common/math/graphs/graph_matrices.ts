import { uint32 } from '../../types/numeric.js'
import { Matrix } from '../linalg/matrix.js'
import { Graph } from './graph.js'

export function adjacencyMatrix(graph: Graph<uint32>) {
  const result = Matrix.zero(graph.order, graph.order)

  for (const arc of graph.iterAllArcs()) {
    result.set(arc.src, arc.dest, 1)
  }

  return result
}

export function pathLengthMatrix(graph: Graph<uint32>) {
  const result = Matrix.fill(graph.order, graph.order, Number.POSITIVE_INFINITY)

  for (const arc of graph.iterAllArcs()) {
    result.set(arc.src, arc.dest, arc.weight)
  }

  return result
}
