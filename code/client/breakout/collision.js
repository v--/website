import { GAME_SIZE, BALL_RADIUS, PADDLE_SIZE, EPSILON } from './constants.js'
import { add, sub, scale, dist, normalize } from './geom/vector.js'
import { fromPointAndVector, intersectLines, reflectPoint } from './geom/line.js'
import { intersectNonHorizontalLineWithEllipse, tangentToLowerSemiellipse } from './geom/ellipse.js'

function checkBallInBrick (brick, ball) {
  return ball.x >= brick.x &&
    ball.x <= brick.x + 1 &&
    ball.y >= brick.y &&
    ball.y <= brick.y + 1
}

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

export function collide (ball, direction, paddleX, bricks) {
  const motionLine = fromPointAndVector(ball, direction)
  const moved = add(ball, direction)

  const paddleEllipse = {
    a: PADDLE_SIZE.x,
    b: PADDLE_SIZE.y,
    x: paddleX,
    y: GAME_SIZE.y
  }

  const paddleIntersection = Math.abs(motionLine.a) < EPSILON ? null : intersectNonHorizontalLineWithEllipse(motionLine, paddleEllipse)
  const paddleTangent = paddleIntersection && tangentToLowerSemiellipse(paddleEllipse, paddleIntersection)

  const bodies = []

  if (paddleTangent) {
    bodies.push({ line: paddleTangent })
  }

  bodies.push({ line: BOTTOM_LINE })
  bodies.push({ line: TOP_LINE })
  bodies.push({ line: LEFT_LINE })
  bodies.push({ line: RIGHT_LINE })

  for (const brick of bricks) {
    bodies.push({ line: { a: 0, b: -1, c: brick.y }, brick, check (ball) { return checkBallInBrick(brick, ball) } })
    bodies.push({ line: { a: 0, b: -1, c: brick.y + 1 }, brick, check (ball) { return checkBallInBrick(brick, ball) } })
    bodies.push({ line: { a: -1, b: 0, c: brick.x }, brick, check (ball) { return checkBallInBrick(brick, ball) } })
    bodies.push({ line: { a: -1, b: 0, c: brick.x + 1 }, brick, check (ball) { return checkBallInBrick(brick, ball) } })
  }

  const collisions = bodies
    .map(function ({ line, brick, check }) {
      const intersection = intersectLines(motionLine, line)

      if (intersection === null || dist(moved, intersection) > dist(ball, intersection)) {
        return null
      }

      if (check && !check(add(ball, scale(direction, 1 + BALL_RADIUS)))) {
        return null
      }

      const normalLine = fromPointAndVector(intersection, { x: line.a, y: line.b })

      const reflectedBall = reflectPoint(line, normalLine, ball)
      const reflectedMoved = reflectPoint(line, normalLine, moved)
      const reflectedDirection = normalize(sub(reflectedBall, reflectedMoved))

      return { intersection, brick, direction: reflectedDirection, dist: dist(ball, intersection) }
    })
    .filter(Boolean)
    .sort((a, b) => a.dist - b.dist)

  if (collisions.length > 0) {
    return collisions[0]
  }

  return null
}
