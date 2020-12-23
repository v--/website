import { Vector } from '../../../common/math/geom2d/vector.js'
import { uint32 } from '../../../common/types/numeric.js'
import { GameBrick } from '../geom/game_brick.js'

export function findBrickIndex(bricks: GameBrick[], origin: Vector): uint32 {
  return bricks.findIndex(brick => brick.origin.x === origin.x && brick.origin.y === origin.y)
}

export function addBrick(bricks: GameBrick[], brick: GameBrick) {
  return bricks.concat([brick])
}

export function changeBrick(bricks: GameBrick[], oldBrick: GameBrick, newBrick: GameBrick) {
  const newBricks = bricks.slice()
  const i = findBrickIndex(bricks, oldBrick.origin)
  newBricks[i] = newBrick
  return newBricks
}

export function removeBrick(bricks: GameBrick[], brick: GameBrick) {
  const newBricks = bricks.slice()
  const i = findBrickIndex(bricks, brick.origin)
  newBricks.splice(i, 1)
  return newBricks
}
