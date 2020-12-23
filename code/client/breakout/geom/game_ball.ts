import { schwartzMin, EmptyIterError } from '../../../common/support/iteration.js'

import { Vector } from '../../../common/math/geom2d/vector.js'
import { Line } from '../../../common/math/geom2d/line.js'
import { Figure } from '../../../common/math/geom/figure.js'
import { Rectangle } from '../../../common/math/geom2d/rectangle.js'
import { Ellipse } from '../../../common/math/geom2d/ellipse.js'
import { GameBrick } from './game_brick.js'

export interface ReflectionParams {
  ball: GameBall
  figure?: Figure
}
export interface Reflection extends ReflectionParams {}
export class Reflection {
  constructor(params: Reflection) {
    Object.assign(this, params)
  }
}

export interface GameBallParams {
  center: Vector
  direction: Vector
  radius: number
}

export interface GameBall extends GameBallParams {}
export class GameBall {
  constructor(params: GameBallParams) {
    Object.assign(this, params)
  }

  translate(amount: number) {
    return new GameBall({
      center: new Vector({
        x: this.center.x + amount * this.direction.x,
        y: this.center.y + amount * this.direction.y
      }),
      direction: this.direction,
      radius: this.radius
    })
  }

  findClosestReflection(reflectionsIterable: Iterable<Reflection>) {
    try {
      return schwartzMin(x => this.center.distanceTo(x.ball.center), reflectionsIterable)
    } catch (err) {
      if (err instanceof EmptyIterError) {
        return 
      }

      throw err
    }
  }

  * _iterCornerDirections() {
    const d = this.direction
    yield d
    yield new Vector({ x: d.y, y: -d.x })
    yield new Vector({ x: -d.y, y: d.x })
    yield new Vector({ x: d.y + d.x, y: d.y - d.x }).scaleToNormed()
    yield new Vector({ x: d.x - d.y, y: d.x + d.y }).scaleToNormed()
  }

  * _iterCorners() {
    for (const cornerDirection of this._iterCornerDirections()) {
      yield this.center.add(cornerDirection.scale(this.radius))
    }
  }

  * _iterReflectionsInRect(rect: Rectangle) {
    for (const edge of rect.edges) {
      for (const corner of this._iterCorners()) {
        const motionLine = Line.fromPointAndVector(corner, this.direction)
        const motionInt = edge.intersectWith(motionLine)

        if (motionInt === undefined) {
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

  reflectInRect(rect: Rectangle) {
    return this.findClosestReflection(this._iterReflectionsInRect(rect))
  }

  * _iterReflectionsInEllipse(ellipse: Ellipse) {
    for (const corner of this._iterCorners()) {
      const motionLine = Line.fromPointAndVector(corner, this.direction)
      const motionInt = ellipse.intersectWithLine(motionLine)

      if (motionInt === undefined || !motionInt.sub(corner).isUnidirectionalWith(this.direction)) {
        continue
      }

      const tangent = ellipse.tangentAtLowerSemiellipse(motionInt)

      if (tangent === undefined) {
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

  reflectInEllipse(ellipse: Ellipse) {
    return this.findClosestReflection(this._iterReflectionsInEllipse(ellipse))
  }

  reclectInGameBrick(brick: GameBrick) {
    const reflection = this.reflectInRect(brick.rectangle)

    if (reflection) {
      return new Reflection({ ball: reflection.ball, figure: brick })
    }
  }
}
