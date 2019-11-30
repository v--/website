export class AlgorithmResult {
  constructor ({ highlightedArcs = new Set(), vertexData = new Map(), arcData = new Map(), start = null, end = null }) {
    this.highlightedArcs = highlightedArcs
    this.vertexData = vertexData
    this.arcData = arcData
    this.start = start
    this.end = end
  }
}
