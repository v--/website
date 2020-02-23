import { schwartzMin, EmptyIterError } from '../../../common/support/iteration.js'

import { Vector } from '../../../common/math/geom2d/vector.js'
import { Line } from '../../../common/math/geom2d/line.js'

export class Reflection {
  constructor ({ ball, figure }) {
    this.ball = ball
    this.figure = figure
  }
}

export class GameBall {
  constructor ({ center, direction, radius }) {
    this.center = center
    this.direction = direction
    this.radius = radius
  }

  translate (amount) {
    return new this.constructor({
      center: new Vector({
        x: this.center.x + amount * this.direction.x,
        y: this.center.y + amount * this.direction.y
      }),
      direction: this.direction,
      radius: this.radius
    })
  }

  findClosestReflection (reflectionsIterable) {
    try {
      return schwartzMin(x => this.center.distanceTo(x.ball.center), reflectionsIterable)
    } catch (err) {
      if (err instanceof EmptyIterError) {
        return null
      }

      throw err
    }
  }

  * _iterCornerDirections () {
    const d = this.direction
    yield d
    yield new Vector({ x: d.y, y: -d.x })
    yield new Vector({ x: -d.y, y: d.x })
    yield new Vector({ x: d.y + d.x, y: d.y - d.x }).scaleToNormed()
    yield new Vector({ x: d.x - d.y, y: d.x + d.y }).scaleToNormed()
  }

  * _iterCorners () {
    for (const cornerDirection of this._iterCornerDirections()) {
      yield this.center.add(cornerDirection.scale(this.radius))
    }
  }

  * _iterReflectionsInRect (rect) {
    for (const edge of rect.edges) {
      for (const corner of this._iterCorners()) {
        const motionLine = Line.fromPointAndVector(corner, this.direction)
        const motionInt = edge.intersectWith(motionLine)

        if (motionInt === null) {
          continue
        }

        const motionDirection = motionInt.sub(corner)

        if (motionDirection.isZeroVector() || !motionInt.sub(corner).isUnidirectionalWith(this.direction) || !rect.containsPoint(motionInt)) {
          continue
        }

        const reflectedCenter = motionDirection.add(this.center)
        const reflectedDirection = edge.reflectDirection(corner, this.direction)

        yield new Reflection({
          ball: new GameBall({ center: reflectedCenter, direction: reflectedDirection, radius: this.radius }),
          figure: rect
        })
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

      yield new Reflection({
        ball: new GameBall({ center: reflectedCenter, direction: reflectedDirection, radius: this.radius }),
        figure: ellipse
      })
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

    return new Reflection({ ball: reflection.ball, figure: brick })
  }
}
