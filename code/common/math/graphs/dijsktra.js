import { range } from '../../support/iteration.js'

export function highlightShortestPath (graph, i, j) {
  const cumWeights = new Map()
  const unmarked = new Set(range(1, graph.order))
  const ancestors = new Map()

  cumWeights.set(i, 0)

  for (const arc of graph.getOutwardArcs(i)) {
    cumWeights.set(arc.dest, arc.weight)
    ancestors.set(arc.dest, i)
  }

  for (let v = 0; v < graph.order; v++) {
    if (!cumWeights.has(v)) {
      cumWeights.set(v, Number.POSITIVE_INFINITY)
    }
  }

  while (true) {
    let min = null

    for (const u of unmarked) {
      if (min === null || cumWeights.get(min) > cumWeights.get(u)) {
        min = u
      }
    }

    unmarked.delete(min)
    if (unmarked.size === 0) {
      break
    }

    for (const arc of graph.getOutwardArcs(min)) {
      if (unmarked.has(arc.dest)) {
        const w = cumWeights.get(min) + arc.weight

        if (w < cumWeights.get(arc.dest)) {
          cumWeights.set(arc.dest, w)
          ancestors.set(arc.dest, min)
        }
      }
    }
  }

  const path = []
  let end = j

  while (end !== i) {
    path.push(end)
    end = ancestors.get(end)
  }

  path.push(i)
  path.reverse()

  for (let i = 1; i < path.length; i++) {
    graph.getArc(path[i - 1], path[i]).highlighted = true
  }

  return path
}
