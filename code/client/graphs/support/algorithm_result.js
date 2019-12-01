export class AlgorithmResult {
  constructor ({ subgraph, vertexData = new Map(), arcData = new Map() } = {}) {
    this.subgraph = subgraph
    this.vertexData = vertexData
    this.arcData = arcData
  }
}
