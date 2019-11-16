import { EPSILON } from '../constants.js'

export class Vector {
  constructor (x, y) {
    this.x = x
    this.y = y
  }

  add (other) {
    return new Vector(this.x + other.x, this.y + other.y)
  }

  sub (other) {
    return new Vector(this.x - other.x, this.y - other.y)
  }

  scale (amount) {
    return new Vector(amount * this.x, amount * this.y)
  }

  scaleToNormed () {
    return this.scale(1 / this.getNorm())
  }

  getNorm () {
    return Math.sqrt(this.x ** 2 + this.y ** 2)
  }

  distanceTo (other) {
    return this.sub(other).getNorm()
  }

  isUnidirectionalWith (other) {
    return this.scaleToNormed().distanceTo(other.scaleToNormed()) < EPSILON
  }
}
