import Entity from './entity.js'
import Collision from './collision.js'
import GameState from '../enums/game_state.js'
import { GAME_SIZE, BALL_RADIUS, REFLECTION_PADDING } from '../constants.js'
import { sub, scale, dist } from '../geom/vector.js'
import { fromPointAndVector, intersectLines, reflectDirection } from '../geom/line.js'

const TOP_LINE = { a: 0, b: -1, c: 0 }
const BOTTOM_LINE = { a: 0, b: -1, c: GAME_SIZE.y }
const LEFT_LINE = { a: -1, b: 0, c: -GAME_SIZE.x / 2 }
const RIGHT_LINE = { a: -1, b: 0, c: GAME_SIZE.x / 2 }
const WALLS = [RIGHT_LINE, BOTTOM_LINE, LEFT_LINE, TOP_LINE]

export default class GameEntity extends Entity {
  collides (ball) {
    return ball.center.x < -GAME_SIZE.x / 2 ||
      ball.center.x > GAME_SIZE.x / 2 ||
      ball.center.y < 0 ||
      ball.center.y > GAME_SIZE.y
  }

  predictCollision (ball) {
    const motionLine = fromPointAndVector(ball.center, ball.direction)
    const intersections = WALLS
      .map(function (wall) {
        const intersection = intersectLines(motionLine, wall)

        return intersection && {
          wall,
          intersection,
          distance: dist(ball.center, intersection)
        }
      })
      .filter(Boolean)
      .sort((a, b) => a.distance - b.distance)

    const closest = intersections[0]
    const reflectedDirection = reflectDirection(closest.wall, closest.intersection, ball.center, ball.direction)
    return new GameCollision(ball, closest.intersection, reflectedDirection)
  }
}

export class GameCollision extends Collision {
  constructor (ball, intersection, reflectedDirection) {
    super()
    this.ball = ball
    this.intersection = intersection
    this.reflectedDirection = reflectedDirection
  }

  get distance () {
    return dist(this.ball.center, this.intersection)
  }

  getStateUpdates () {
    if (this.intersection.y === GAME_SIZE.y) {
      return {
        state: GameState.GAME_OVER,
        ball: {
          center: { x: this.ball.center.x, y: this.intersection.y - BALL_RADIUS },
          direction: this.reflectedDirection
        }
      }
    }

    return {
      ball: {
        center: sub(this.intersection, scale(this.ball.direction, BALL_RADIUS + REFLECTION_PADDING)),
        direction: this.reflectedDirection
      }
    }
  }
}
