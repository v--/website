import { Vector } from '../../../common/math/geom2d/vector.js'

import { findBrickIndex, addBrick, changeBrick } from '../support/bricks.js'
import { NEW_BRICK_SAFETY_DISTANCE } from '../constants.js'
import { GameBrick } from '../geom/game_brick.js'

export function evolve (subject) {
  const { ball, stage, bricks } = subject.value

  const selectedBrick = bricks[Math.floor(Math.random() * bricks.length)]
  const evolveBrickItself = Math.random() < 1 / 9

  let newBricks = null

  if (evolveBrickItself) {
    const newBrick = selectedBrick.getEvolved()

    if (newBrick !== null) {
      newBricks = changeBrick(bricks, selectedBrick, newBrick)
    }
  } else {
    const angle = Math.random() * Math.PI
    const origin = new Vector({
      x: selectedBrick.origin.x + Math.round(Math.cos(angle)),
      y: selectedBrick.origin.y + Math.round(Math.sin(angle))
    })

    if (!stage.containsPoint(origin) || origin.distanceTo(ball.center) < NEW_BRICK_SAFETY_DISTANCE) {
      return
    }

    const existingIndex = findBrickIndex(bricks, origin)
    const existingBrick = existingIndex > -1 ? bricks[existingIndex] : null

    if (existingBrick) {
      const newBrick = selectedBrick.getEvolved()

      if (newBrick !== null) {
        newBricks = changeBrick(bricks, selectedBrick, newBrick)
      }
    } else {
      const newBrick = new GameBrick({ origin, power: 1 })
      newBricks = addBrick(bricks, newBrick)
    }
  }

  if (newBricks !== null) {
    subject.update({ bricks: newBricks })
  }
}
