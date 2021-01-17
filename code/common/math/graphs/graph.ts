import { map, range, sort } from '../../support/iteration.js'
import { MathError } from '../errors.js'

export class GraphError extends MathError {}
export class EmptyGraphError extends GraphError {}
export class GraphTraversalError extends GraphError {}

export interface GraphArcParams<T> {
  src: T
  dest: T
  weight?: float64
}

export interface GraphArc<T> extends Required<GraphArcParams<T>> {}
export class GraphArc<T> {
  constructor(params: GraphArcParams<T>) {
    if (params.src === params.dest) {
      throw new GraphError('The graph cannot contain loops')
    }

    Object.assign(this, { weight: 0 }, params)
  }

  clone() {
    return new GraphArc(this)
  }
}

export interface GraphVertexDataParams<T> {
  vertex: T
  arcs?: Array<GraphArc<T>>
}

export interface GraphVertexData<T> extends Required<GraphVertexDataParams<T>> {}
export class GraphVertexData<T> {
  constructor(params: GraphVertexDataParams<T>) {
    Object.assign(this, { arcs: [] }, params)
  }

  get degree() {
    return this.arcs.length
  }

  addArc(arc: GraphArc<T>) {
    if (this.arcs.some(a => a.dest === arc.dest)) {
      throw new GraphError(`Vertex ${this.vertex} already has an arc to ${arc.dest}`)
    }

    this.arcs.push(arc)
  }

  getArcWith(dest: T) {
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

export interface GraphParams<T> {
  incidence?: Map<T, GraphVertexData<T>>
}

export interface Graph<T> extends Required<GraphParams<T>> {}
export class Graph<T> {
  static fromArcs<T>(arcs: Array<GraphArc<T>>) {
    const graph = new this<T>()

    for (const arc of arcs) {
      graph.addArc(arc)
    }

    return graph
  }

  static fromArcData<T>(arcs: Array<GraphArcParams<T>>) {
    const graph = new this<T>()

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

  constructor({ incidence = new Map<T, GraphVertexData<T>>() }: GraphParams<T> = {}) {
    this.incidence = incidence
  }

  containsVertex(vertex: T) {
    return this.incidence.has(vertex)
  }

  private getVertexData(vertex: T) {
    if (!this.incidence.has(vertex)) {
      throw new GraphError(`No such vertex ${vertex}`)
    }

    return this.incidence.get(vertex)!
  }

  addArc(arc: GraphArc<T>) {
    if (!this.incidence.has(arc.src)) {
      this.incidence.set(arc.src, new GraphVertexData({ vertex: arc.src }))
    }

    if (!this.incidence.has(arc.dest)) {
      this.incidence.set(arc.dest, new GraphVertexData({ vertex: arc.dest }))
    }

    this.incidence.get(arc.src)!.addArc(arc)
  }

  hasArc(src: T, dest: T) {
    const vertexData = this.incidence.get(src)

    if (vertexData) {
      return vertexData.arcs.some(arc => arc.dest === dest)
    }

    return false
  }

  get order() {
    return this.incidence.size
  }

  getArc(src: T, dest: T) {
    if (!this.incidence.has(src)) {
      return undefined
    }

    return this.incidence.get(src)!.getArcWith(dest)
  }

  * iterIncomingArcs(vertex: T) {
    for (const arc of this.iterAllArcs()) {
      if (arc.dest === vertex) {
        yield arc
      }
    }
  }

  getIncomingArcs(vertex: T) {
    return Array.from(this.iterIncomingArcs(vertex))
  }

  iterOutgoingArcs(vertex: T) {
    return this.getVertexData(vertex).getArcs()[Symbol.iterator]()
  }

  getOutgoingArcs(vertex: T) {
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
    const newIncidenceEntries = map(([k, v]) => [k, v.clone()], this.incidence.entries()) as Iterable<[T, GraphVertexData<T>]>
    const newIncidence = new Map(newIncidenceEntries)
    return new Graph({ incidence: newIncidence })
  }

  getSymmetricClosure() {
    const closure = new Graph<T>()

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
