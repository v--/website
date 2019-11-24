import { map } from '../../support/iteration.js'
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

    this._arcs.push(arc)
  }

  getArcWith (dest) {
    return this._arcs.find(v => v.dest === dest) || null
  }

  getArcs () {
    return this._arcs
  }

  clone () {
    return new this.constructor({ vertex: this._vertex, arcs: this._arcs.map(arc => arc.clone()) })
  }
}

export class GraphArc {
  constructor ({ src, dest, label = null, weight = 1 }) {
    if (src === dest) {
      throw new GraphError('The graph cannot contain loops')
    }

    this.src = src
    this.dest = dest
    this.weight = weight
    this.label = label
  }

  clone () {
    return new this.constructor(this)
  }
}

export class Graph {
  static fromArcData (arcs) {
    const graph = new Graph({})

    for (const arc of arcs) {
      graph.addArc(new GraphArc(arc))
    }

    return graph
  }

  constructor ({ incidence = new Map() }) {
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

  * iterInwardArcs (vertex) {
    for (const arc of this.iterAllArcs()) {
      if (arc.dest === vertex) {
        yield arc
      }
    }
  }

  getInwardArcs (vertex) {
    return Array.from(this.iterInwardArcs(vertex))
  }

  * iterOutwardArcs (vertex) {
    return this._getVertexData(vertex).getArcs()
  }

  getOutwardArcs (vertex) {
    return this._getVertexData(vertex).getArcs()
  }

  * iterAllArcs () {
    for (const vertexData of this._incidence.values()) {
      for (const arc of vertexData.getArcs()) {
        yield arc
      }
    }
  }

  getAllArcs () {
    return Array.from(this.iterAllArcs())
  }

  * iterAllVertices () {
    for (let v = 0; v < this.order; v++) {
      yield v
    }
  }

  getAllVertices () {
    return Array.from(this.iterAllVertices())
  }

  clone () {
    const newIncidenceEntries = map(([k, v]) => [k, v.clone()], this._incidence.entries())
    const newIncidence = new Map(newIncidenceEntries)
    return new this.constructor({ incidence: newIncidence })
  }
}
