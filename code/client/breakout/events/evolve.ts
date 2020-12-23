import { Vector } from '../../../common/math/geom2d/vector.js'

import { findBrickIndex, addBrick, changeBrick } from '../support/bricks.js'
import { NEW_BRICK_SAFETY_DISTANCE } from '../constants.js'
import { GameBrick } from '../geom/game_brick.js'
import { DictSubject } from '../../../common/observables/dict_subject.js'
import { IGameState } from '../game_state.js'
import { Optional } from '../../../common/types/typecons.js'

export function evolve(subject$: DictSubject<IGameState>) {
  const { ball, stage, bricks } = subject$.value

  const selectedBrick = bricks[Math.floor(Math.random() * bricks.length)]
  const evolveBrickItself = Math.random() < 1 / 9

  let newBricks: Optional<GameBrick[]>

  if (evolveBrickItself) {
    const newBrick = selectedBrick.getEvolved()

    if (newBrick) {
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
    const existingBrick = existingIndex > -1 ? bricks[existingIndex] : undefined

    if (existingBrick) {
      const newBrick = selectedBrick.getEvolved()

      if (newBrick) {
        newBricks = changeBrick(bricks, selectedBrick, newBrick)
      }
    } else {
      const newBrick = new GameBrick({ origin, power: 1 })
      newBricks = addBrick(bricks, newBrick)
    }
  }

  if (newBricks) {
    subject$.update({ bricks: newBricks })
  }
}
