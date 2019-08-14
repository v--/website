import Vector from './geom/vector.js'
import Rectangle from './geom/rectangle.js'
import Ellipse from './geom/ellipse.js'
import GameBall from './geom/game_ball.js'
import GameBrick from './geom/game_brick.js'

export const DEFAULT_GAME_STATE = {
  score: 0,

  paddleDirection: 0,
  paddle: new Ellipse(
    new Vector(0, 15),
    new Vector(2, 0.5)
  ),

  stage: new Rectangle(
    new Vector(-10, 0),
    new Vector(20, 15)
  ),

  ball: new GameBall(
    new Vector(0, 5),
    new Vector(0, 1),
    0.3
  ),

  bricks: [
    new GameBrick(
      new Vector(-7, 3),
      1
    ),

    new GameBrick(
      new Vector(6, 3),
      1
    )
  ]
}
