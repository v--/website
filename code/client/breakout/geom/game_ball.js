import { schwartzMin, EmptyIterError } from '../../../common/support/iteration.js'

import { Vector } from '../../../common/math/geom2d/vector.js'
import { Line } from '../../../common/math/geom2d/line.js'
import { Rectangle } from '../../../common/math/geom2d/rectangle.js'
import { Ellipse } from '../../../common/math/geom2d/ellipse.js'
import { GameBrick } from './game_brick.js'

/**
 * @implements TBreakout.IGameBall
 */
export class GameBall {
  /** @param {TBreakout.IGameBallParams} params */
  constructor({ center, direction, radius }) {
    this.center = center
    this.direction = direction
    this.radius = radius
  }

  /** @param {TNum.Float64} amount */
  translate(amount) {
    return new GameBall({
      center: new Vector({
        x: this.center.x + amount * this.direction.x,
        y: this.center.y + amount * this.direction.y
      }),
      direction: this.direction,
      radius: this.radius
    })
  }

  /** @param {Iterable<TBreakout.IReflection>} reflectionsIterable */
  findClosestReflection(reflectionsIterable) {
    try {
      return schwartzMin(x => this.center.distanceTo(x.ball.center), reflectionsIterable)
    } catch (err) {
      if (err instanceof EmptyIterError) {
        return 
      }

      throw err
    }
  }

  /**
   * @returns {Iterable<Vector>}
   */
  * _iterCornerDirections() {
    const d = this.direction
    yield d
    yield new Vector({ x: d.y, y: -d.x })
    yield new Vector({ x: -d.y, y: d.x })
    yield new Vector({ x: d.y + d.x, y: d.y - d.x }).scaleToNormed()
    yield new Vector({ x: d.x - d.y, y: d.x + d.y }).scaleToNormed()
  }

  /**
   * @returns {Iterable<Vector>}
   */
  * _iterCorners() {
    for (const cornerDirection of this._iterCornerDirections()) {
      yield this.center.add(cornerDirection.scale(this.radius))
    }
  }

  /**
   * @param {Rectangle} rect
   * @returns {Iterable<TBreakout.IReflection>}
   */
  * _iterReflectionsInRect(rect) {
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

        yield {
          ball: new GameBall({ center: reflectedCenter, direction: reflectedDirection, radius: this.radius }),
          figure: rect
        }
      }
    }
  }

  /** @param {Rectangle} rect */
  reflectInRect(rect) {
    return this.findClosestReflection(this._iterReflectionsInRect(rect))
  }

  /**
   * @param {Ellipse} ellipse
   * @returns {Iterable<TBreakout.IReflection>}
   */
  * _iterReflectionsInEllipse(ellipse) {
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

      yield {
        ball: new GameBall({ center: reflectedCenter, direction: reflectedDirection, radius: this.radius }),
        figure: ellipse
      }
    }
  }

  /** @param {Ellipse} ellipse */
  reflectInEllipse(ellipse) {
    return this.findClosestReflection(this._iterReflectionsInEllipse(ellipse))
  }

  /** @param {GameBrick} brick */
  reflectInGameBrick(brick) {
    const reflection = this.reflectInRect(brick.rectangle)

    if (reflection) {
      return { ball: reflection.ball, figure: brick }
    }
  }
}
