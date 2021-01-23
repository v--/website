declare namespace TGraphs {
  export type GraphLayout<T> = TCons.NonStrictMap<T, TGeom2D.IVector>

  export interface IGraphArcParams<T> {
    src: T
    dest: T
    weight?: TNum.Float64
  }

  export interface IGraphArc<T> extends Required<IGraphArcParams<T>> {
    clone(): IGraphArc<T>
  }

  export interface IGraphVertexDataParams<T> {
    vertex: T
    arcs?: Array<IGraphArc<T>>
  }

  export interface IGraphVertexData<T> extends Required<IGraphVertexDataParams<T>> {
    degree: TNum.UInt32
    addArc(arc: IGraphArc<T>): void
    getArcWith(dest: T): IGraphArc<T> | undefined
    getArcs(): Array<IGraphArc<T>>
    clone(): IGraphVertexData<T>
  }

  export interface IGraphParams<T> {
    incidence?: Map<T, IGraphVertexData<T>>
  }

  export interface IGraph<T> extends Required<IGraphParams<T>> {
    order: TNum.UInt32

    containsVertex(vertex: T): boolean
    getVertexData(vertex: T): IGraphVertexData<T>

    addArc(arc: IGraphArc<T>): void
    hasArc(src: T, dest: T): boolean
    getArc(src: T, dest: T): IGraphArc<T> | undefined

    iterAllVertices(): Iterable<T>
    getAllVertices(): T[]

    iterIncomingArcs(vertex: T): Iterable<IGraphArc<T>>
    getIncomingArcs(vertex: T): Array<IGraphArc<T>>

    iterOutgoingArcs(vertex: T): Iterable<IGraphArc<T>>
    getOutgoingArcs(vertex: T): Array<IGraphArc<T>>

    iterAllArcs(): Iterable<IGraphArc<T>>
    getAllArcs(): Array<IGraphArc<T>>

    clone(): IGraph<T>
    getSymmetricClosure(): IGraph<T>
  }
}
