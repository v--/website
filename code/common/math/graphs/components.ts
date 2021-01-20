import { Graph } from './graph.js'

function recurseAndLabel<T>(graph: Graph<T>, v: T, marked: Set<T>, labels: GraphComponentMap<T>) {
  const currentLabel = labels.get(v)
  for (const arc of graph.iterOutgoingArcs(v)) {
    if (!marked.has(arc.dest)) {
      labels.set(arc.dest, currentLabel)
      marked.add(arc.dest)
      recurseAndLabel(graph, arc.dest, marked, labels)
    }
  }
}

export type GraphComponentMap<T> = TCons.NonStrictMap<T, TNum.UInt32>

export function labelComponents<T>(graph: Graph<T>): GraphComponentMap<T> {
  const marked = new Set<T>()
  const labels: GraphComponentMap<T> = new Map()
  let currentLabel = 0

  for (const v of graph.iterAllVertices()) {
    if (!marked.has(v)) {
      labels.set(v, currentLabel++)
      recurseAndLabel(graph, v, marked, labels)
    }
  }

  return labels
}
