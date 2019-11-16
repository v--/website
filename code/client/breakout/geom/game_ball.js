import { Vector } from './vector.js'

export class GameBall {
  constructor (center, direction, radius) {
    this.center = center
    this.direction = direction
    this.radius = radius
  }

  translate (amount) {
    return new this.constructor(
      new Vector(
        this.center.x + amount * this.direction.x,
        this.center.y + amount * this.direction.y
      ),
      this.direction,
      this.radius
    )
  }

  findClosestReflection (reflections) {
    if (reflections.length === 0) {
      return null
    }

    return reflections.sort(function (a, b) {
      return this.center.distanceTo(a.ball.center) - this.center.distanceTo(b.ball.center)
    }.bind(this))[0]
  }

  * generateCornerDirections () {
    const d = this.direction
    yield d
    yield new Vector(d.y, -d.x)
    yield new Vector(-d.y, d.x)
    yield new Vector(d.y + d.x, d.y - d.x).scaleToNormed()
    yield new Vector(d.x - d.y, d.x + d.y).scaleToNormed()
  }

  * generateCorners () {
    for (const cornerDirection of this.generateCornerDirections()) {
      yield this.center.add(cornerDirection.scale(this.radius))
    }
  }
}
