import { sort } from '../../../common/support/iteration.js'

import { Vector } from '../../../common/math/geom2d/vector.js'
import { Line } from '../../../common/math/geom2d/line.js'

export class Reflection {
  constructor (ball, figure) {
    this.ball = ball
    this.figure = figure
  }
}

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
    const sorted = sort(reflections, function (a, b) {
      return this.center.distanceTo(a.ball.center) - this.center.distanceTo(b.ball.center)
    }.bind(this))

    if (sorted.length === 0) {
      return null
    }

    return sorted[0]
  }

  * _iterCornerDirections () {
    const d = this.direction
    yield d
    yield new Vector(d.y, -d.x)
    yield new Vector(-d.y, d.x)
    yield new Vector(d.y + d.x, d.y - d.x).scaleToNormed()
    yield new Vector(d.x - d.y, d.x + d.y).scaleToNormed()
  }

  * _iterCorners () {
    for (const cornerDirection of this._iterCornerDirections()) {
      yield this.center.add(cornerDirection.scale(this.radius))
    }
  }

  * _iterReflectionsInRect (rect) {
    for (const wall of rect.walls) {
      for (const corner of this._iterCorners()) {
        const motionLine = Line.fromPointAndVector(corner, this.direction)
        const motionInt = wall.intersectWith(motionLine)

        if (motionInt === null || !motionInt.sub(corner).isUnidirectionalWith(this.direction) || !rect.containsPoint(motionInt)) {
          continue
        }

        const reflectedCenter = motionInt.sub(corner.sub(this.center))
        const reflectedDirection = wall.reflectDirection(corner, this.direction)

        yield new Reflection(
          new GameBall(reflectedCenter, reflectedDirection, this.radius),
          rect
        )
      }
    }
  }

  reflectInRect (rect) {
    return this.findClosestReflection(this._iterReflectionsInRect(rect))
  }

  * _iterReflectionsInEllipse (ellipse) {
    for (const corner of this._iterCorners()) {
      const motionLine = Line.fromPointAndVector(corner, this.direction)
      const motionInt = ellipse.intersectWithLine(motionLine)

      if (motionInt === null || !motionInt.sub(corner).isUnidirectionalWith(this.direction)) {
        continue
      }

      const tangent = ellipse.tangentAtLowerSemiellipse(motionInt)

      if (tangent === null) {
        continue
      }

      const reflectedCenter = motionInt.sub(corner.sub(this.center))
      const reflectedDirection = tangent.reflectDirection(corner, this.direction)

      yield new Reflection(
        new GameBall(reflectedCenter, reflectedDirection, this.radius),
        ellipse
      )
    }
  }

  reflectInEllipse (ellipse) {
    return this.findClosestReflection(this._iterReflectionsInEllipse(ellipse))
  }

  reclectInGameBrick (brick) {
    const reflection = this.reflectInRect(brick.rectangle)

    if (reflection === null) {
      return null
    }

    return new Reflection(reflection.ball, brick)
  }
}
