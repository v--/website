import Matrix from './linalg/matrix.js'

export default class Graph {
  constructor (incidence, highlighted = new Set()) {
    this.incidence = incidence
    this.highlighted = highlighted
  }

  addEdge (src, dest) {
    const newIncidence = this.incidence.slice()
    newIncidence[src].push(dest)
    return new this.constructor(newIncidence)
  }

  highlightEdge (src, dest) {
    return new this.constructor(this.incidence, new Set([src, dest]))
  }

  get order () {
    return this.incidence.length
  }

  getEdges () {
    const edges = []

    for (let i = 0; i < this.order; i++) {
      for (let j = i; j < this.order; j++) {
        const a = this.incidence[i].some(v => v === j)
        const b = this.incidence[j].some(v => v === i)

        if (a && b) {
          edges.push({
            from: i,
            to: j,
            directed: false
          })
        } else if (a) {
          edges.push({
            from: i,
            to: j,
            directed: true
          })
        } else if (b) {
          edges.push({
            from: j,
            to: i,
            directed: true
          })
        }
      }
    }

    return edges
  }

  getSymmetrizedAdjacency () {
    const symmetrized = Matrix.zero(this.order)

    for (let i = 0; i < this.order; i++) {
      for (const j of this.incidence[i]) {
        symmetrized.setInline(i, j, 1)
        symmetrized.setInline(j, i, 1)
      }
    }

    return symmetrized
  }

  getSymmetrizedLaplacian () {
    const diagonal = []
    const symmetrized = this.getSymmetrizedAdjacency()

    for (let i = 0; i < this.order; i++) {
      let d = 0

      for (let j = 0; j < this.order; j++) {
        d += symmetrized.get(i, j)
      }

      diagonal.push(d)
    }

    return Matrix.diagonal(diagonal).sub(symmetrized)
  }
}
