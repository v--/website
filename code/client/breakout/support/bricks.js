export function addBrick (bricks, brick) {
  return bricks.concat([brick])
}

export function changeBrick (bricks, oldBrick, newBrick) {
  const newBricks = bricks.slice()
  const i = bricks.indexOf(oldBrick)
  newBricks[i] = newBrick
  return newBricks
}

export function removeBrick (bricks, brick) {
  const newBricks = bricks.slice()
  const i = bricks.indexOf(brick)
  newBricks.splice(i, 1)
  return newBricks
}
