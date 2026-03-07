import { BreakoutBrick } from './geom/brick.ts'
import { DEFAULT_BALL_SOURCE, DEFAULT_PADDLE } from './geom/constants.ts'
import { type IIncompleteGameState } from './types.ts'

export const DEFAULT_GAME_STATE: IIncompleteGameState = {
  phase: 'unstarted',
  paddle: DEFAULT_PADDLE,
  score: 0,
  ballPosition: 0.0,
  ballSource: DEFAULT_BALL_SOURCE,
  ballTarget: DEFAULT_PADDLE.intersectWithBall(DEFAULT_BALL_SOURCE, { x: 0.0, y: 1.0 })!,
  bricks: [
    new BreakoutBrick({ power: 1, x: -7, y: 2 }),
    new BreakoutBrick({ power: 1, x: 6, y: 2 }),
  ],
}
