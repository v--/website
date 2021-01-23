import { map, range, sort } from '../../support/iteration.js'
import { MathError } from '../errors.js'

export class GraphError extends MathError {}
export class EmptyGraphError extends GraphError {}
export class GraphTraversalError extends GraphError {}

/**
 * @template T
 * @implements TGraphs.IGraphArc<T>
 */
export class GraphArc {
  /**
   * @param {TGraphs.IGraphArcParams<T>} params
   */
  constructor({ src, dest, weight = 0 }) {
    if (src === dest) {
      throw new GraphError('The graph cannot contain loops')
    }

    this.src = src
    this.dest = dest
    this.weight = weight
  }

  clone() {
    return new GraphArc(this)
  }
}

/**
 * @template T
 * @implements TGraphs.IGraphVertexData<T>
 */
export class GraphVertexData {
  /**
   * @param {TGraphs.IGraphVertexDataParams<T>} params
   */
  constructor({ vertex, arcs = [] }) {
    this.vertex = vertex
    this.arcs = arcs
  }

  get degree() {
    return this.arcs.length
  }

  /** @param {GraphArc<T>} arc */
  addArc(arc) {
    if (this.arcs.some(a => a.dest === arc.dest)) {
      throw new GraphError(`Vertex ${this.vertex} already has an arc to ${arc.dest}`)
    }

    this.arcs.push(arc)
  }

  /** @param {T} dest */
  getArcWith(dest) {
    return this.arcs.find(v => v.dest === dest) 
  }

  getArcs() {
    return this.arcs
  }

  clone() {
    return new GraphVertexData({
      vertex: this.vertex,
      arcs: this.arcs.map(arc => arc.clone())
    })
  }
}

/**
 * @template T
 * @implements TGraphs.IGraph<T>
 */
export class Graph {
  /**
   * @template T
   * @param {Array<GraphArc<T>>} arcs
   */
  static fromArcs(arcs) {
    const graph = new this()

    for (const arc of arcs) {
      graph.addArc(arc)
    }

    return graph
  }

  /**
   * @template T
   * @param {Array<TGraphs.IGraphArcParams<T>>} arcs
   */
  static fromArcData(arcs) {
    /** @type {Graph<T>} */
    const graph = new this()

    for (const arc of arcs) {
      graph.addArc(new GraphArc(arc))
    }

    return graph
  }

  static empty(order = 0) {
    return new Graph({
      incidence: new Map(map(vertex => [vertex, new GraphVertexData({ vertex })], range(order)))
    })
  }

  /** @param {TGraphs.IGraphParams<T>} params */
  constructor({ incidence = new Map() } = {}) {
    this.incidence = incidence
  }

  /** @param {T} vertex */
  containsVertex(vertex) {
    return this.incidence.has(vertex)
  }

  /** @param {T} vertex */
  getVertexData(vertex) {
    if (!this.incidence.has(vertex)) {
      throw new GraphError(`No such vertex ${vertex}`)
    }

    return /** @type {GraphVertexData<T>} */ (this.incidence.get(vertex))
  }

  /**
   * @param {GraphArc<T>} arc
   */
  addArc(arc) {
    if (!this.incidence.has(arc.src)) {
      this.incidence.set(arc.src, new GraphVertexData({ vertex: arc.src }))
    }

    if (!this.incidence.has(arc.dest)) {
      this.incidence.set(arc.dest, new GraphVertexData({ vertex: arc.dest }))
    }

    /** @type {GraphVertexData<T>} */ (this.incidence.get(arc.src)).addArc(arc)
  }

  /**
   * @param {T} src
   * @param {T} dest
   */
  hasArc(src, dest) {
    const vertexData = this.incidence.get(src)

    if (vertexData) {
      return vertexData.arcs.some(arc => arc.dest === dest)
    }

    return false
  }

  get order() {
    return this.incidence.size
  }

  /**
   * @param {T} src
   * @param {T} dest
   */
  getArc(src, dest) {
    if (!this.incidence.has(src)) {
      return undefined
    }

    return /** @type {GraphVertexData<T>} */ (this.incidence.get(src)).getArcWith(dest)
  }

  /**
   * @param {T} vertex
   * @returns {Generator<GraphArc<T>>}
   */
  * iterIncomingArcs(vertex) {
    for (const arc of this.iterAllArcs()) {
      if (arc.dest === vertex) {
        yield arc
      }
    }
  }

  /**
   * @param {T} vertex
   * @returns {Array<GraphArc<T>>}
   */
  getIncomingArcs(vertex) {
    return Array.from(this.iterIncomingArcs(vertex))
  }

  /**
   * @param {T} vertex
   * @returns {Iterable<GraphArc<T>>}
   */
  iterOutgoingArcs(vertex) {
    return this.getVertexData(vertex).getArcs()[Symbol.iterator]()
  }

  /**
   * @param {T} vertex
   * @returns {Array<GraphArc<T>>}
   */
  getOutgoingArcs(vertex) {
    return this.getVertexData(vertex).getArcs()
  }

  * iterAllArcs() {
    for (const vertexData of this.incidence.values()) {
      for (const arc of vertexData.getArcs()) {
        yield arc
      }
    }
  }

  getAllArcs() {
    return Array.from(this.iterAllArcs())
  }

  iterAllVertices() {
    return sort(this.incidence.keys())
  }

  getAllVertices() {
    return Array.from(this.iterAllVertices())
  }

  clone() {
    const newIncidenceEntries = map(([k, v]) => /** @type {[T, GraphVertexData<T>]} */ ([k, v.clone()]), this.incidence.entries())
    const newIncidence = new Map(newIncidenceEntries)
    return new Graph({ incidence: newIncidence })
  }

  getSymmetricClosure() {
    /** @type {Graph<T>} */
    const closure = new Graph()

    for (const arc of this.iterAllArcs()) {
      closure.addArc(arc)
      const rev = this.getArc(arc.dest, arc.src)

      if (rev) {
        closure.addArc(new GraphArc({ src: arc.dest, dest: arc.src, weight: arc.weight }))
      }
    }

    return closure
  }
}
