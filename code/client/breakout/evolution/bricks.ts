import { randInt } from '../../../common/math/prob.ts'
import { isGeq, isLeq } from '../../../common/support/floating.ts'
import { BreakoutBrick } from '../brick.ts'
import { BRICK_EVOLUTION_BALL_MIN_DISTANCE, BRICK_EVOLUTION_BOTTOM_MIN_DISTANCE, BRICK_MAX_POWER, STAGE } from '../constants.ts'
import { type IGameState } from '../types.ts'

const MAX_EVOLUTION_ATTEMPTS = 3

export function evolveBricks({ bricks, ball }: IGameState): Partial<IGameState> | undefined {
  for (let i = 0; i < MAX_EVOLUTION_ATTEMPTS; i++) {
    const centerIndex = randInt(0, bricks.length)
    const xOffset = randInt(-1, 2)
    const yOffset = randInt(-1, 2)
    const center = bricks[centerIndex]
    let brickIndex = centerIndex

    // We avoid bricks too close to the ball position.
    if (ball.center.distanceTo(center) < BRICK_EVOLUTION_BALL_MIN_DISTANCE) {
      continue
    }

    const point = {
      x: center.x + xOffset,
      y: center.y + yOffset,
    }

    // We avoid bricks too close to the paddle.
    if (STAGE.getBottomPos() - point.y < BRICK_EVOLUTION_BOTTOM_MIN_DISTANCE) {
      continue
    }

    if (xOffset !== 0 || yOffset !== 0) {
      // We avoid "off-screen" bricks that cannot be reached.
      // STAGE.containsPoint may miss bricks on the right or bottom
      if (
        isLeq(point.x, STAGE.getLeftPos()) ||
        isGeq(point.x, STAGE.getRightPos() - 1) ||
        isLeq(point.y, STAGE.getTopPos()) ||
        isGeq(point.y, STAGE.getBottomPos() - 1)
      ) {
        continue
      }

      brickIndex = bricks.findIndex(b => b.x === point.x && b.y === point.y)

      if (brickIndex === -1) {
        const newBrick = new BreakoutBrick({ ...point, power: 1 })

        return {
          bricks: bricks.concat([newBrick]),
        }
      }
    }

    const brick = bricks[brickIndex]

    if (brick.power < BRICK_MAX_POWER) {
      return {
        bricks: bricks.toSpliced(brickIndex, 1, brick.evolve()),
      }
    }
  }
}
