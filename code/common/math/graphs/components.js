import { Graph } from './graph.js'

/**
 * @template T
 * @param {Graph<T>} graph
 * @param {T} v
 * @param {Set<T>} marked
 * @param {TGraphOpt.IGraphComponentMap<T>} marked
 * @param {TGraphOpt.IGraphComponentMap<T>} labels
 */
function recurseAndLabel(graph, v, marked, labels) {
  const currentLabel = labels.get(v)
  for (const arc of graph.iterOutgoingArcs(v)) {
    if (!marked.has(arc.dest)) {
      labels.set(arc.dest, currentLabel)
      marked.add(arc.dest)
      recurseAndLabel(graph, arc.dest, marked, labels)
    }
  }
}

/**
 * @template T
 * @param {Graph<T>} graph
 * @returns {TGraphOpt.IGraphComponentMap<T>}
 */
export function labelComponents(graph) {
  /** @type {Set<T>} */
  const marked = new Set()

  /** @type {TGraphOpt.IGraphComponentMap<T>} */
  const labels = new Map()

  let currentLabel = 0

  for (const v of graph.iterAllVertices()) {
    if (!marked.has(v)) {
      labels.set(v, currentLabel++)
      recurseAndLabel(graph, v, marked, labels)
    }
  }

  return labels
}
