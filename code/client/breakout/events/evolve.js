import { GAME_SIZE, MAX_BRICK_POWER } from '../constants.js'
import { checkBallInBrick } from '../collision.js'

export default function evolve (subject) {
  const { bricks, ball } = subject.value

  const selectedBrick = bricks[Math.floor(Math.random() * bricks.length)]
  const evolveBrickItself = Math.random() < 1 / 9

  if (evolveBrickItself) {
    if (selectedBrick.power < MAX_BRICK_POWER) {
      const newBricks = bricks.map(function (brick) {
        if (brick === selectedBrick) {
          return { x: brick.x, y: brick.y, power: brick.power + 1 }
        }

        return brick
      })

      subject.update({ bricks: newBricks })
    }
  } else {
    const angle = Math.random() * Math.PI
    const x = selectedBrick.x + Math.round(Math.cos(angle))
    const y = selectedBrick.y + Math.round(Math.sin(angle))
    const existingBrick = bricks.find(brick => brick.x === x && brick.y === y)

    if (x < GAME_SIZE.x / 2 || x > GAME_SIZE.x / 2 || y < 0 || y > GAME_SIZE.y) {
      return
    }

    if (existingBrick) {
      if (existingBrick.power < MAX_BRICK_POWER) {
        const newBricks = bricks.map(function (brick) {
          if (brick === existingBrick) {
            return { x, y, power: brick.power + 1 }
          }

          return brick
        })

        subject.update({ bricks: newBricks })
      }
    } else {
      const newBrick = { x, y, power: 1 }

      if (!checkBallInBrick(newBrick, ball)) {
        subject.update({ bricks: bricks.concat(newBrick) })
      }
    }
  }
}
