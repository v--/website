export class AlgorithmResult {
  constructor ({ path = [], vertexData = new Map(), arcData = new Map() }) {
    this.path = path
    this.vertexData = vertexData
    this.arcData = arcData
  }
}
