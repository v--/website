import Matrix from './linalg/matrix.js'

export default class Graph {
  constructor (incidence, highlighted = new Set()) {
    this.incidence = incidence
    this.highlighted = highlighted
  }

  addEdge (src, dest) {
    const newIncidence = this.incidence.set(src, dest, 1)
    return new this.constructor(newIncidence)
  }

  highlightEdge (src, dest) {
    return new this.constructor(this.incidence, new Set([src, dest]))
  }

  get order () {
    return this.incidence.rows
  }

  getEdges () {
    const edges = []

    for (let i = 0; i < this.order; i++) {
      for (let j = i; j < this.order; j++) {
        const a = this.incidence.get(i, j) === 1
        const b = this.incidence.get(j, i) === 1

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

  getSymmetrizedIncidence () {
    const symmetrized = Matrix.zero(this.order)

    for (let i = 0; i < this.order; i++) {
      for (let j = 0; j < this.order; j++) {
        symmetrized.setInline(i, j, Math.max(this.incidence.get(i, j), this.incidence.get(j, i)))
      }
    }

    return symmetrized
  }

  getSymmetrizedLaplacian () {
    const diagonal = []
    const symmetrized = this.getSymmetrizedIncidence()

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
