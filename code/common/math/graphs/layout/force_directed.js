import { enumerate } from '../../../support/iteration.js'
import { Vector } from '../../geom2d/vector.js'
import { Graph } from '../graph.js'

/**
 * @param {Vector} vector
 */
function clampToUnitCircle(vector) {
  const norm = vector.getNorm()

  if (norm > 1) {
    return vector.scale(1 / norm)
  }

  return vector
}

/**
 * Find a layout using the Fruchterman-Reingold algorithm
 * @template T
 * @param {Graph<T>} graph
 * @returns {TGraphs.GraphLayout<T>}
 */
export function getForceDirectedLayout(graph) {
  const n = graph.order
  const area = 4 // The bounding square of the unit circle
  const k = Math.sqrt(area / n)

  /** @type {TCons.NonStrictMap<T, Vector>} */
  const layout = new Map()

  // Initialize a circular layout
  for (const [i, v] of enumerate(graph.iterAllVertices())) {
    layout.set(v, Vector.fromPolar(1, 2 * Math.PI * (i / n)))
  }

  for (let temperature = 1; temperature > 0; temperature -= 1e-1) {
    /** @type {TCons.NonStrictMap<T, Vector>} */
    const displacement = new Map() 

    for (const v of graph.iterAllVertices()) {
      displacement.set(v, new Vector({ x: 0, y: 0 }))

      for (const u of graph.iterAllVertices()) {
        if (u === v) {
          continue
        }

        const dir = layout.get(v).sub(layout.get(u))
        const dist = dir.getNorm()

        // The following code is equivalent to
        // > repulsion = k * k / dist
        // > delta = dir.scale(repulsion / dist)
        const delta = dir.scale((k * k) / (dist * dist))

        displacement.set(v, displacement.get(v).add(delta))
      }
    }

    for (const arc of graph.iterAllArcs()) {
      const dir = layout.get(arc.dest).sub(layout.get(arc.src))
      const dist = dir.getNorm() / arc.weight

      // The following code is equivalent to
      // > attraction = dist * dist / k
      // > delta = dir.scale(attraction / dist)
      const delta = dir.scale(dist / k)

      displacement.set(arc.dest, displacement.get(arc.dest).sub(delta))
      displacement.set(arc.src, displacement.get(arc.src).add(delta))
    }

    for (const v of graph.iterAllVertices()) {
      const pos = layout.get(v)
      const disp = displacement.get(v)
      const norm = disp.getNorm()
      const delta = disp.scale(Math.min(norm, temperature) / norm)

      layout.set(v, clampToUnitCircle(pos.add(delta)))
    }
  }

  return layout
}
