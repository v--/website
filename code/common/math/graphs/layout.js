import { Vector } from '../geom2d/vector.js'

function clampToUnitCircle (vector) {
  const norm = vector.getNorm()

  if (norm > 1) {
    return vector.scale(1 / norm)
  }

  return vector
}

/**
 * Find a layout using the Fruchterman-Reingold algorithm
 */
export function findUnitSquareLayout (graph) {
  const n = graph.order
  const area = 4 // The bounding square of the unit circle
  const k = Math.sqrt(area / n)
  const layout = []

  // Initialize a circular layout
  for (let v = 0; v < n; v++) {
    layout[v] = Vector.fromPolar(1, 2 * Math.PI * (v / n))
  }

  for (let temperature = 1; temperature > 0; temperature -= 1e-1) {
    const displacement = []

    for (let v = 0; v < n; v++) {
      displacement[v] = new Vector(0, 0)

      for (let u = 0; u < n; u++) {
        if (u === v) {
          continue
        }

        const dir = layout[v].sub(layout[u])
        const dist = dir.getNorm()

        // The following code is equivalent to
        // > repulsion = k * k / dist
        // > delta = dir.scale(repulsion / dist)
        const delta = dir.scale((k * k) / (dist * dist))

        displacement[v] = displacement[v].add(delta)
      }
    }

    for (const arc of graph.getAllArcs()) {
      const dir = layout[arc.dest].sub(layout[arc.src])
      const dist = dir.getNorm() / arc.weight

      // The following code is equivalent to
      // > attraction = dist * dist / k
      // > delta = dir.scale(attraction / dist)
      const delta = dir.scale(dist / k)

      displacement[arc.dest] = displacement[arc.dest].sub(delta)
      displacement[arc.src] = displacement[arc.src].add(delta)
    }

    for (let v = 0; v < n; v++) {
      const pos = layout[v]
      const disp = displacement[v]
      const norm = disp.getNorm()
      const delta = disp.scale(Math.min(norm, temperature) / norm)

      layout[v] = clampToUnitCircle(pos.add(delta))
    }
  }

  return layout
}
