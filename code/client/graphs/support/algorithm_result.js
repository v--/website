export class AlgorithmResult {
  constructor ({ subgraph, vertexData = new Map(), arcData = new Map(), start = null, end = null } = {}) {
    this.subgraph = subgraph
    this.vertexData = vertexData
    this.arcData = arcData
    this.start = start
    this.end = end
  }
}
