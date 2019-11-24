import { range } from '../../../common/support/iteration.js'
import { getForceDirectedLayout } from '../../../common/math/graphs/layout/force_directed.js'

import { AlgorithmResult } from '../support/algorithm_result.js'
import { AlgorithmType } from '../enums/algorithm_type.js'
import { DEFAULT_GRAPH } from '../graphs.js'

export const dijkstra = Object.freeze({
  name: "Dijsktra's algorithm",
  type: AlgorithmType.SHORTEST_PATH,
  date: '2019-11-15',
  getLayout: getForceDirectedLayout,
  graph: DEFAULT_GRAPH,

  run (graph, start = 0, end = graph.order - 1) {
    const cumLengths = new Map()
    const unmarked = new Set(range(1, graph.order))
    const ancestors = new Map()

    cumLengths.set(start, 0)

    for (const arc of graph.getOutwardArcs(start)) {
      cumLengths.set(arc.dest, arc.weight)
      ancestors.set(arc.dest, start)
    }

    for (const v of graph.iterAllVertices()) {
      if (!cumLengths.has(v)) {
        cumLengths.set(v, Number.POSITIVE_INFINITY)
      }
    }

    while (true) {
      let min = null

      for (const u of unmarked) {
        if (min === null || cumLengths.get(min) > cumLengths.get(u)) {
          min = u
        }
      }

      unmarked.delete(min)
      if (unmarked.size === 0) {
        break
      }

      for (const arc of graph.getOutwardArcs(min)) {
        if (unmarked.has(arc.dest)) {
          const w = cumLengths.get(min) + arc.weight

          if (w < cumLengths.get(arc.dest)) {
            cumLengths.set(arc.dest, w)
            ancestors.set(arc.dest, min)
          }
        }
      }
    }

    const shortest = []

    for (const v of graph.iterAllVertices()) {
      const path = []
      let current = v

      while (current !== undefined && current !== start) {
        path.push(current)
        current = ancestors.get(current)
      }

      path.push(start)
      path.reverse()
      shortest[v] = path
    }

    const vertexData = new Map()
    const arcData = new Map()

    for (const v of graph.iterAllVertices()) {
      const length = cumLengths.get(v)
      const datum = []

      if (Number.isFinite(length)) {
        datum.push(
          {
            label: 'Shortest path',
            value: shortest[v].join(' -> ')
          },
          {
            label: 'Shortest path length',
            value: cumLengths.get(start, v)
          }
        )
      }

      vertexData.set(v, datum)
    }

    for (const arc of graph.getAllArcs()) {
      arcData.set(arc, [
        {
          label: 'Arc length',
          value: arc.weight
        }
      ])
    }

    const path = shortest[end]
    return new AlgorithmResult({ path, vertexData, arcData })
  }
})
