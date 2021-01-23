import { schwartzMin, EmptyIterError } from '../../../common/support/iteration.js'

import { Vector } from '../../../common/math/geom2d/vector.js'
import { Line } from '../../../common/math/geom2d/line.js'
import { Rectangle } from '../../../common/math/geom2d/rectangle.js'
import { Ellipse } from '../../../common/math/geom2d/ellipse.js'
import { GameBrick } from './game_brick.js'

/**
 * @param {GameBall} ball
 * @param {TGeom2D.IRectangle} rect
 * @returns {Iterable<Reflection>}
 */
function * iterReflectionsInRect(ball, rect) {
  for (const edge of rect.edges) {
    for (const corner of iterCorners(ball)) {
      const motionLine = Line.fromPointAndVector(corner, ball.direction)
      const motionInt = edge.intersectWith(motionLine)

      if (motionInt === undefined) {
        continue
      }

      const motionDirection = motionInt.sub(corner)

      if (motionDirection.isZeroVector() || !motionInt.sub(corner).isUnidirectionalWith(ball.direction) || !rect.containsPoint(motionInt)) {
        continue
      }

      const reflectedCenter = motionDirection.add(ball.center)
      const reflectedDirection = edge.reflectDirection(corner, ball.direction)

      yield {
        ball: new GameBall({ center: reflectedCenter, direction: reflectedDirection, radius: ball.radius }),
        figure: rect
      }
    }
  }
}

/**
 * @param {GameBall} ball
 * @returns {Iterable<Vector>}
 */
function * iterCornerDirections(ball) {
  const d = ball.direction
  yield d
  yield new Vector({ x: d.y, y: -d.x })
  yield new Vector({ x: -d.y, y: d.x })
  yield new Vector({ x: d.y + d.x, y: d.y - d.x }).scaleToNormed()
  yield new Vector({ x: d.x - d.y, y: d.x + d.y }).scaleToNormed()
}

/**
 * @param {GameBall} ball
 * @returns {Iterable<Vector>}
 */
function * iterCorners(ball) {
  for (const cornerDirection of iterCornerDirections(ball)) {
    yield ball.center.add(cornerDirection.scale(ball.radius))
  }
}

/**
 * @param {GameBall} ball
 * @param {Ellipse} ellipse
 * @returns {Iterable<Reflection>}
 */
function * iterReflectionsInEllipse(ball, ellipse) {
  for (const corner of iterCorners(ball)) {
    const motionLine = Line.fromPointAndVector(corner, ball.direction)
    const motionInt = ellipse.intersectWithLine(motionLine)

    if (motionInt === undefined || !motionInt.sub(corner).isUnidirectionalWith(ball.direction)) {
      continue
    }

    const tangent = ellipse.tangentAtLowerSemiellipse(motionInt)

    if (tangent === undefined) {
      continue
    }

    const reflectedCenter = motionInt.sub(corner.sub(ball.center))
    const reflectedDirection = tangent.reflectDirection(corner, ball.direction)

    yield new Reflection({
      ball: new GameBall({ center: reflectedCenter, direction: reflectedDirection, radius: ball.radius }),
      figure: ellipse
    })
  }
}

/**
 * @implements TBreakout.IReflection
 */
export class Reflection {
  /** @param {TBreakout.IReflectionParams} params */
  constructor({ ball, figure }) {
    this.ball = ball
    this.figure = figure
  }
}

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

  /** @param {Iterable<Reflection>} reflectionsIterable */
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

  /** @param {Rectangle} rect */
  reflectInRect(rect) {
    return this.findClosestReflection(iterReflectionsInRect(this, rect))
  }

  /** @param {Ellipse} ellipse */
  reflectInEllipse(ellipse) {
    return this.findClosestReflection(iterReflectionsInEllipse(this, ellipse))
  }

  /** @param {GameBrick} brick */
  reflectInGameBrick(brick) {
    const reflection = this.reflectInRect(brick.rectangle)

    if (reflection) {
      return new Reflection({ ball: reflection.ball, figure: brick })
    }
  }
}
