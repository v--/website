import { map, range, sort } from '../../support/iteration.js'
import { MathError } from '../errors.js'

export class GraphError extends MathError {}
export class EmptyGraphError extends GraphError {}
export class GraphTraversalError extends GraphError {}

export class GraphVertexData {
  constructor ({ vertex, arcs = [] } = {}) {
    this._vertex = vertex
    this._arcs = arcs
  }

  get degree () {
    return this._arcs.length
  }

  addArc (arc) {
    if (this._arcs.some(a => a.dest === arc.dest)) {
      throw new GraphError(`Vertex ${this._vertex} already has an arc to ${arc.dest}`)
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
  constructor ({ src, dest, weight = 1 } = {}) {
    if (src === dest) {
      throw new GraphError('The graph cannot contain loops')
    }

    this.src = src
    this.dest = dest
    this.weight = weight
  }

  clone () {
    return new this.constructor(this)
  }
}

export class Graph {
  static fromArcs (arcs) {
    const graph = new this()

    for (const arc of arcs) {
      graph.addArc(arc)
    }

    return graph
  }

  static fromArcData (arcs) {
    const graph = new this()

    for (const arc of arcs) {
      graph.addArc(new GraphArc(arc))
    }

    return graph
  }

  static empty (order = 0) {
    return new Graph({
      incidence: new Map(map(vertex => [vertex, new GraphVertexData({ vertex })], range(order)))
    })
  }

  constructor ({ incidence = new Map() } = {}) {
    this._incidence = incidence
  }

  _getVertexData (vertex) {
    if (!this._incidence.has(vertex)) {
      throw new GraphError(`No such vertex ${vertex}`)
    }

    return this._incidence.get(vertex)
  }

  addArc (arc) {
    if (!this._incidence.has(arc.src)) {
      this._incidence.set(arc.src, new GraphVertexData({ vertex: arc.src }))
    }

    if (!this._incidence.has(arc.dest)) {
      this._incidence.set(arc.dest, new GraphVertexData({ vertex: arc.dest }))
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

  * iterIncomingArcs (vertex) {
    for (const arc of this.iterAllArcs()) {
      if (arc.dest === vertex) {
        yield arc
      }
    }
  }

  getIncomingArcs (vertex) {
    return Array.from(this.iterIncomingArcs(vertex))
  }

  iterOutgoingArcs (vertex) {
    return this._getVertexData(vertex).getArcs()[Symbol.iterator]()
  }

  getOutgoingArcs (vertex) {
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

  iterAllVertices () {
    return sort(this._incidence.keys())
  }

  getAllVertices () {
    return Array.from(this.iterAllVertices())
  }

  clone () {
    const newIncidenceEntries = map(([k, v]) => [k, v.clone()], this._incidence.entries())
    const newIncidence = new Map(newIncidenceEntries)
    return new this.constructor({ incidence: newIncidence })
  }

  getSymmetricClosure () {
    const closure = new this.constructor()

    for (const arc of this.iterAllArcs()) {
      closure.addArc(arc)
      const rev = this.getArc(arc.dest, arc.src)

      if (rev === null) {
        closure.addArc(new GraphArc({ src: arc.dest, dest: arc.src, weight: arc.weight }))
      }
    }

    return closure
  }
}
