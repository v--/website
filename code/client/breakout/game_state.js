import { Vector } from '../../common/math/geom2d/vector.js'
import { Rectangle } from '../../common/math/geom2d/rectangle.js'
import { Ellipse } from '../../common/math/geom2d/ellipse.js'

import { GameBall } from './geom/game_ball.js'
import { GameBrick } from './geom/game_brick.js'

/** @type {TCons.PartialWith<TBreakout.IGameState, 'eventLoop'>} */
export const DEFAULT_GAME_STATE = Object.freeze({
  status: 'unstarted',
  score: 0,
  paddleDirection: 0,

  paddle: new Ellipse({
    center: new Vector({ x: 0, y: 15 }),
    axes: new Vector({ x: 2, y: 0.5 })
  }),

  stage: new Rectangle({
    origin: new Vector({ x: -10, y: 0 }),
    dims: new Vector({ x: 20, y: 15 })
  }),

  ball: new GameBall({
    center: new Vector({ x: 0, y: 5 }),
    direction: new Vector({ x: 0, y: 1 }),
    radius: 0.3
  }),

  bricks: [
    new GameBrick({
      origin: new Vector({ x: -7, y: 3 }),
      power: 1
    }),

    new GameBrick({
      origin: new Vector({ x: 6, y: 3 }),
      power: 1
    })
  ]
})
