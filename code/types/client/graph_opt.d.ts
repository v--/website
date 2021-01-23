declare namespace TGraphOpt {
  export type AlgorithmType =
    'arborescence' |
    'minSpanningTree' |
    'shortestPathTree' |
    'longestPath' |
    'maximumFlow'

  export type AlgorithmId =
    'dfs_arborescence' |
    'bfs_arborescence' |
    'prim' |
    'boruvka' |
    'kruskal' |
    'dijkstra' |
    'floyd' |
    'topological_shortest_path' |
    'bellman_ford' |
    'moore' |
    'postorder_longest_path' |
    'ford_fulkerson'

  export type IGraphComponentMap<T> = TCons.NonStrictMap<T, TNum.UInt32>

  export interface IGraphAlgorithmDatum {
    label: string
    value: string
  }

  export type IGraphAlgorithmSummary = IGraphAlgorithmDatum[]

  export type IGraphAlgorithmArcData<T> = Map<TGraphs.IGraphArc<T>, IGraphAlgorithmDatum>
  export type IGraphAlgorithmVertexData<T> = Map<T, IGraphAlgorithmDatum[]>

 export interface IGraphAlgorithmResult<T> {
    subgraph: TGraphs.IGraph<T>
    vertexData: IGraphAlgorithmVertexData<T>
    arcData: IGraphAlgorithmArcData<T>
    summary?: IGraphAlgorithmSummary,
    start?: T,
    end?: T
  }

  export interface IGraphAlgorithm<T> {
    name: string,
    id: TGraphOpt.AlgorithmId,
    type: TGraphOpt.AlgorithmType,
    date: TDates.ISODateString,
    graph: TGraphs.IGraph<T>,
    layout: TGraphs.GraphLayout<T>,
    run(graph: TGraphs.IGraph<T>, start?: T, end?: T): IGraphAlgorithmResult<T>
  }

  export interface IGraphAlgorithmState<T> {
    algorithm?: IGraphAlgorithm<T>,
    graph?: TGraphs.IGraph<T>,
    layout?: TGraphs.GraphLayout<T>
    result?: IGraphAlgorithmResult<T>,

    hoveredVertex?: T,
    hoveredArc?: TGraphs.IGraphArc<T>,

    start?: T,
    end?: T,

    hoverVertex: (vertex?: T) => void
    hoverArc: (arc?: TGraphs.IGraphArc<T>) => void

    changeStart: (vertex?: T) => void
    changeEnd: (vertex?: T) => void

    runAlgorithm: TCons.Action<IGraphAlgorithm<T>>
 }

  export type ISuccessfulGraphAlgorithmState<T> = TCons.RequiredWith<
    IGraphAlgorithmState<T>,
    'algorithm' | 'graph' | 'layout' | 'result'
  >
}
