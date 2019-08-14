export function findBrickIndex (bricks, origin) {
  return bricks.findIndex(brick => brick.origin.x === origin.x && brick.origin.y === origin.y)
}

export function addBrick (bricks, brick) {
  return bricks.concat([brick])
}

export function changeBrick (bricks, oldBrick, newBrick) {
  const newBricks = bricks.slice()
  const i = findBrickIndex(bricks, oldBrick.origin)
  newBricks[i] = newBrick
  return newBricks
}

export function removeBrick (bricks, brick) {
  const newBricks = bricks.slice()
  const i = findBrickIndex(bricks, brick.origin)
  newBricks.splice(i, 1)
  return newBricks
}
