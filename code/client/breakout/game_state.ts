import { Vector } from '../../common/math/geom2d/vector.js'
import { Rectangle } from '../../common/math/geom2d/rectangle.js'
import { Ellipse } from '../../common/math/geom2d/ellipse.js'

import { GameBall } from './geom/game_ball.js'
import { GameBrick } from './geom/game_brick.js'
import { GameStatus } from './enums/game_status.js'
import { EventLoop } from '../core/support/event_loop.js'

export type PaddleDirection = -1 | 0 | 1
export interface IGameState {
  eventLoop: EventLoop
  status: GameStatus
  score: Num.UInt32
  paddleDirection: PaddleDirection
  paddle: Ellipse
  stage: Rectangle
  ball: GameBall
  bricks: GameBrick[]
}

export const DEFAULT_GAME_STATE = Object.freeze({
  status: GameStatus.unstarted,
  score: 0,
  paddleDirection: 0 as PaddleDirection,

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
