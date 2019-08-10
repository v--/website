import { s } from '../../../common/support/svg.js'

import GameState from '../enums/game_state.js'
import { GAME_SIZE, PADDLE_SIZE, BALL_RADIUS } from '../constants.js'

const VIEW_BOX = [-GAME_SIZE.x / 2, 0, GAME_SIZE.x, GAME_SIZE.y].join(' ')

export default function breakout ({ state, paddleX, ball, bricks, score }) {
  return s(
    'svg',
    {
      class: 'breakout',
      viewBox: VIEW_BOX
    },

    s('g', { class: 'bricks' }, ...bricks.map(function (brick) {
      return s('rect', { class: 'brick', x: String(brick.x), y: String(brick.y), width: '1', height: '1' })
    })),
    s('ellipse', { class: 'paddle', cx: String(paddleX), cy: '15', rx: String(PADDLE_SIZE.x), ry: String(PADDLE_SIZE.y) }),
    s('circle', { class: 'ball', cx: String(ball.x), cy: String(ball.y), r: String(BALL_RADIUS) }),
    s('text', { class: 'score', text: `Score: ${score}`, x: String(-GAME_SIZE.x / 2 + BALL_RADIUS), y: '1' }),

    state === GameState.UNSTARTED &&
      s('text', { class: 'splash', text: 'Press Space Bar', y: String(GAME_SIZE.y / 2) }),

    state === GameState.PAUSED &&
      s('text', { class: 'splash', text: 'Paused', y: String(GAME_SIZE.y / 2) }),

    state === GameState.COMPLETED &&
      s('text', { class: 'splash', text: 'Game Over', y: String(GAME_SIZE.y / 2) })
  )
}
