import { Graph, GraphTraversalError } from './graph.js'
import { repeat, zip2 } from '../../support/iteration.js'

/**
 * @template T
 * @param {Graph<T>} graph
 * @param {TCons.NonStrictMap<T, TNum.Float64>} pre
 * @param {TCons.NonStrictMap<T, TNum.Float64>} post
 * @param {T[]} order
 * @param {T} v
 * @param {TNum.UInt32} clock
 * @returns {TNum.UInt32}
 */
function postorderDFS(graph, pre, post, order, v, clock) {
  pre.set(v, clock++)

  for (const arc of graph.iterOutgoingArcs(v)) {
    if (pre.get(arc.dest) >= pre.get(v) && post.get(arc.dest) < pre.get(v)) {
      clock = postorderDFS(graph, pre, post, order, arc.dest, clock)
    }
  }

  order.push(v)
  post.set(v, clock++)
  return clock
}

/**
 * @template T
 * @param {Graph<T>} graph
 * @param {T} start
 * @returns {T[]}
 */
export function postorder(graph, start) {
  if (!graph.containsVertex(start)) {
    throw new GraphTraversalError('The starting vertex must belong to the graph')
  }

  /** @type {T[]} */
  const order = []

  const pre = /** @type {TCons.NonStrictMap<T, TNum.Float64>} */ (
    new Map(zip2(graph.iterAllVertices(), repeat(Number.POSITIVE_INFINITY, graph.order)))
  )

  const post = /** @type {TCons.NonStrictMap<T, TNum.Float64>} */ (
    new Map(zip2(graph.iterAllVertices(), repeat(Number.NEGATIVE_INFINITY, graph.order)))
  )

  postorderDFS(graph, pre, post, order, start, 0)
  return order
}

/**
 * @template T
 * @param {Graph<T>} graph
 * @param {T} start
 * @returns {T[]}
 */
export function topologicalOrder(graph, start) {
  return postorder(graph, start).reverse()
}
