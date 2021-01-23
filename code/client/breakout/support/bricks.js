import { Vector } from '../../../common/math/geom2d/vector.js'
import { repr } from '../../../common/support/strings.js'
import { BreakoutError } from '../errors.js'
import { GameBrick } from '../geom/game_brick.js'

export class BrickNotFoundError extends BreakoutError {}

/**
 * @param {GameBrick[]} bricks
 * @param {Vector} origin
 * @returns {TNum.UInt32 | -1}
 */
export function findBrickIndex(bricks, origin) {
  return bricks.findIndex(brick => brick.origin.x === origin.x && brick.origin.y === origin.y)
}

/**
 * @param {GameBrick[]} bricks
 * @param {GameBrick} brick
 * @returns {GameBrick[]}
 */
export function addBrick(bricks, brick) {
  return bricks.concat([brick])
}

/**
 * @param {GameBrick[]} bricks
 * @param {GameBrick} oldBrick
 * @param {GameBrick} newBrick
 * @returns {GameBrick[]}
 */
export function changeBrick(bricks, oldBrick, newBrick) {
  const newBricks = bricks.slice()
  const i = findBrickIndex(bricks, oldBrick.origin)

  if (i === -1) {
    throw new BrickNotFoundError(`Could not find brick ${repr(oldBrick)}`)
  }

  newBricks[i] = newBrick
  return newBricks
}

/**
 * @param {GameBrick[]} bricks
 * @param {GameBrick} brick
 * @returns {GameBrick[]}
 */
export function removeBrick(bricks, brick) {
  const newBricks = bricks.slice()
  const i = findBrickIndex(bricks, brick.origin)

  if (i === -1) {
    throw new BrickNotFoundError(`Could not find brick ${repr(brick)}`)
  }

  newBricks.splice(i, 1)
  return newBricks
}
