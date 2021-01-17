import { Graph, GraphTraversalError } from './graph.js'
import { repeat, zip } from '../../support/iteration.js'

function postorderDFS<T>(graph: Graph<T>, pre: Map<T, uint32>, post: Map<T, uint32>, order: T[], v: T, clock: uint32) {
  pre.set(v, clock++)

  for (const arc of graph.getOutgoingArcs(v)) {
    if (pre.get(arc.dest)! >= pre.get(v)! && post.get(arc.dest)! < pre.get(v)!) {
      clock = postorderDFS(graph, pre, post, order, arc.dest, clock)
    }
  }

  order.push(v)
  post.set(v, clock++)
  return clock
}

export function postorder<T>(graph: Graph<T>, start: T) {
  if (!graph.containsVertex(start)) {
    throw new GraphTraversalError('The starting vertex must belong to the graph')
  }

  const order: T[] = []
  const pre = new Map(zip(graph.iterAllVertices(), repeat(Number.POSITIVE_INFINITY, graph.order)))
  const post = new Map(zip(graph.iterAllVertices(), repeat(Number.NEGATIVE_INFINITY, graph.order)))
  postorderDFS(graph, pre, post, order, start, 0)
  return order
}

export function topologicalOrder<T>(graph: Graph<T>, start: T) {
  return postorder(graph, start).reverse()
}
