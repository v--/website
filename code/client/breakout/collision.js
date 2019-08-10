import { GAME_SIZE, PADDLE_SIZE } from './constants.js'
import { add, sub, dist, normalize } from './geom/vector.js'
import { fromPointAndVector, intersectLines, reflectPoint } from './geom/line.js'
import { intersectLineWithEllipse, tangentLineToEllipse } from './geom/ellipse.js'

const PADDLE_ELLIPSE = { a: PADDLE_SIZE.x, b: PADDLE_SIZE.y }

const TOP_LINE = {
  a: 0,
  b: -1,
  c: 0
}

const BOTTOM_LINE = {
  a: 0,
  b: -1,
  c: GAME_SIZE.y
}

const LEFT_LINE = {
  a: -1,
  b: 0,
  c: -GAME_SIZE.x / 2
}

const RIGHT_LINE = {
  a: -1,
  b: 0,
  c: GAME_SIZE.x / 2
}

export function collide (ball, direction, _bricks) {
  const motionLine = fromPointAndVector(ball, direction)
  const moved = add(ball, direction)

  const paddleIntersection = intersectLineWithEllipse(motionLine, PADDLE_ELLIPSE)
  const paddleTangent = tangentLineToEllipse(PADDLE_ELLIPSE, paddleIntersection)

  const collisions = [paddleTangent, TOP_LINE, BOTTOM_LINE, LEFT_LINE, RIGHT_LINE]
    .map(function (line) {
      const intersection = intersectLines(motionLine, line)

      if (intersection === null || dist(moved, intersection) > dist(ball, intersection)) {
        return null
      }

      const reflectedBall = reflectPoint(line, ball)
      const reflectedMoved = reflectPoint(line, moved)
      const reflectedDirection = normalize(sub(reflectedBall, reflectedMoved))

      return { intersection, direction: reflectedDirection, dist: dist(ball, intersection) }
    })
    .filter(Boolean)
    .sort((a, b) => a.dist - b.dist)

  if (collisions.length > 0) {
    return collisions[0]
  }

  return null
}
