import Matrix from '../linalg/matrix.js'

import { MathError } from '../errors.js'

export class GraphError extends MathError {}

export class GraphVertexData {
  constructor ({ vertex, arcs = [] }) {
    this._vertex = vertex
    this._arcs = arcs
  }

  get degree () {
    return this._arcs.length
  }

  addArc (arc) {
    if (this._arcs.some(a => a.dest === arc.dest)) {
      throw new GraphError(`Vertex ${this.vertex} already has an arc to ${arc.dest}`)
    }

    this._arcs.push(new GraphArc(arc))
  }

  getArcWith (dest) {
    return this._arcs.find(v => v.dest === dest) || null
  }

  getArcs () {
    return this._arcs
  }
}

export class GraphArc {
  constructor ({ src, dest, label = null, weight = 1, highlighted = false }) {
    if (src === dest) {
      throw new Error('The graph cannot contain loops')
    }

    this.src = src
    this.dest = dest
    this.weight = weight
    this.label = label
    this.highlighted = highlighted
  }
}

export default class Graph {
  static fromArcs (arcs) {
    const graph = new Graph()

    for (const arc of arcs) {
      graph.addArc(arc)
    }

    return graph
  }

  constructor (incidence = new Map()) {
    this._incidence = incidence
  }

  _getVertexData (vertex) {
    if (!this._incidence.has(vertex)) {
      throw new GraphError(`No such vertex ${vertex}`)
    }

    return this._incidence.get(vertex)
  }

  addArc (arc) {
    const max = Math.max(arc.src, arc.dest)

    for (let i = 0; i <= max; i++) {
      if (!this._incidence.has(i)) {
        this._incidence.set(i, new GraphVertexData({ vertex: arc.src }))
      }
    }

    this._incidence.get(arc.src).addArc(arc)
  }

  get order () {
    return this._incidence.size
  }

  getArc (src, dest) {
    if (!this._incidence.has(src)) {
      return null
    }

    return this._incidence.get(src).getArcWith(dest)
  }

  * _iterInwardArcs (vertex) {
    for (const arc of this._iterArcs()) {
      if (arc.dest === vertex) {
        yield arc
      }
    }
  }

  getInwardArcs (vertex) {
    return Array.from(this._iterInwardArcs(vertex))
  }

  getOutwardArcs (vertex) {
    return this._getVertexData(vertex).getArcs()
  }

  * _iterArcs () {
    for (const vertexData of this._incidence.values()) {
      for (const arc of vertexData.getArcs()) {
        yield arc
      }
    }
  }

  getAllArcs () {
    return Array.from(this._iterArcs())
  }

  getSymmetrizedAdjacency () {
    const symmetrized = Matrix.zero(this.order)

    for (const arc of this._iterArcs()) {
      symmetrized.setInline(arc.src, arc.dest, 1)
      symmetrized.setInline(arc.dest, arc.src, 1)
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
