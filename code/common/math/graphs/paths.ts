import { Graph, GraphArc } from './graph.js'

export function findPath<T>(graph: Graph<T>, start: T, end: T, marked = new Set<T>()): Array<GraphArc<T>> | undefined {
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
