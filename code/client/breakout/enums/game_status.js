import { enumerate } from '../../../common/support/enumerate.js'

export const GameStatus = enumerate(
  'UNSTARTED',
  'RUNNING',
  'PAUSED',
  'COMPLETED',
  'GAME_OVER'
)
