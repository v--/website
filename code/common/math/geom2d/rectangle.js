import { Line } from './line.js'

export class Rectangle {
  constructor (origin, size) {
    this.origin = origin
    this.size = size

    this.walls = [
      new Line(0, -1, this.origin.y),
      new Line(0, -1, this.origin.y + this.size.y),
      new Line(-1, 0, this.origin.x),
      new Line(-1, 0, this.origin.x + this.size.x)
    ]
  }

  containsPoint (point) {
    return point.x >= this.origin.x &&
      point.x <= this.origin.x + this.size.x &&
      point.y >= this.origin.y &&
      point.y <= this.origin.y + this.size.y
  }
}
