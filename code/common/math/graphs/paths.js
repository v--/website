import { Graph, GraphArc } from './graph.js'

/**
 * @template T
 * @param {Graph<T>} graph
 * @param {T} start
 * @param {T} end
 * @param {Set<T>} marked
 * @returns {Array<GraphArc<T>> | undefined}
 */
export function findPath(graph, start, end, marked = new Set()) {
  marked.add(start)

  if (start === end) {
    return []
  }

  for (const arc of graph.iterOutgoingArcs(start)) {
    if (marked.has(arc.dest)) {
      continue
    }

    const path = findPath(graph, arc.dest, end, marked)

    if (path) {
      return [arc].concat(path)
    }
  }
}
