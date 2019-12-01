import { GraphTraversalError } from './graph.js'
import { repeat } from '../../support/iteration.js'

function postorderDFS (graph, pre, post, order, v, clock) {
  pre[v] = clock++

  for (const arc of graph.getOutgoingArcs(v)) {
    if (pre[arc.dest] >= pre[v] && post[arc.dest] < pre[v]) {
      clock = postorderDFS(graph, pre, post, order, arc.dest, clock)
    }
  }

  order.push(v)
  post[v] = clock++
  return clock
}

export function postorder (graph, start = 0) {
  if (graph.order <= start) {
    throw new GraphTraversalError('The starting vertex must belong to the graph')
  }

  const order = []
  const pre = Array.from(repeat(Number.POSITIVE_INFINITY, graph.order))
  const post = Array.from(repeat(Number.NEGATIVE_INFINITY, graph.order))
  postorderDFS(graph, pre, post, order, start, 0)
  return order
}

export function topologicalOrder (graph, start = 0) {
  return postorder(graph, start).reverse()
}
