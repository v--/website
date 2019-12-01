import { GraphTraversalError } from './graph.js'
import { repeat } from '../../support/iteration.js'

function topOrderDFS (graph, preorder, postorder, reverseOrder, v, clock) {
  preorder[v] = clock++

  for (const arc of graph.getOutcomingArcs(v)) {
    if (preorder[arc.dest] >= preorder[v] && postorder[arc.dest] < preorder[v]) {
      clock = topOrderDFS(graph, preorder, postorder, reverseOrder, arc.dest, clock)
    }
  }

  reverseOrder.push(v)
  postorder[v] = clock++
  return clock
}

export function topologicalOrder (graph, start = 0) {
  if (graph.order <= start) {
    throw new GraphTraversalError('The starting vertex must belong to the graph')
  }

  const reverseOrder = []
  const preorder = Array.from(repeat(Number.POSITIVE_INFINITY, graph.order))
  const postorder = Array.from(repeat(Number.NEGATIVE_INFINITY, graph.order))
  topOrderDFS(graph, preorder, postorder, reverseOrder, start, 0)
  reverseOrder.reverse()
  return reverseOrder
}
