import { Line } from './line.js'
import { Vector } from './vector.js'

export interface RectangleParams {
  origin: Vector
  dims: Vector
}

export interface Rectangle extends RectangleParams {
  edges: [Line, Line, Line, Line]
  center: Vector
}

export class Rectangle {
  constructor(params: RectangleParams) {
    Object.assign(this, params)

    this.edges = [
      new Line({ a: 0, b: -1, c: this.origin.y }),
      new Line({ a: 0, b: -1, c: this.origin.y + this.dims.y }),
      new Line({ a: -1, b: 0, c: this.origin.x }),
      new Line({ a: -1, b: 0, c: this.origin.x + this.dims.x })
    ]

    this.center = this.origin.add(this.dims.scale(0.5))
  }

  containsPoint(point: Vector) {
    return point.x >= this.origin.x &&
      point.x <= this.origin.x + this.dims.x &&
      point.y >= this.origin.y &&
      point.y <= this.origin.y + this.dims.y
  }
}
