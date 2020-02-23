import { Line } from './line.js'

export class Rectangle {
  constructor ({ origin, dims }) {
    this.origin = origin
    this.dims = dims

    this.edges = [
      new Line({ a: 0, b: -1, c: this.origin.y }),
      new Line({ a: 0, b: -1, c: this.origin.y + this.dims.y }),
      new Line({ a: -1, b: 0, c: this.origin.x }),
      new Line({ a: -1, b: 0, c: this.origin.x + this.dims.x })
    ]
  }

  containsPoint (point) {
    return point.x >= this.origin.x &&
      point.x <= this.origin.x + this.dims.x &&
      point.y >= this.origin.y &&
      point.y <= this.origin.y + this.dims.y
  }
}
