import { s } from '../../../common/support/svg.js'

import GameState from '../enums/game_state.js'
import { WIDTH, HEIGHT, PADDLE_WIDTH, BALL_RADIUS } from '../constants.js'

const VIEW_BOX = [-WIDTH / 2, 0, WIDTH, HEIGHT].join(' ')

export default function breakout ({ state, paddleX, ballPos, blocks, score }) {
  return s(
    'svg',
    {
      class: 'breakout',
      viewBox: VIEW_BOX
    },

    s('ellipse', { class: 'paddle', cx: String(paddleX), cy: '15', rx: String(PADDLE_WIDTH), ry: '0.3' }),
    s('circle', { class: 'ball', cx: String(ballPos.x), cy: String(ballPos.y), r: String(BALL_RADIUS) }),
    s('text', { class: 'score', text: `Score: ${score}`, x: String(-WIDTH / 2 + BALL_RADIUS), y: '1' }),
    s('g', { class: 'blocks' }, ...blocks.map(function (block) {
      return s('rect', { class: 'block', x: String(block.x), y: String(block.y), width: '1', height: '1' })
    })),

    state === GameState.UNSTARTED &&
      s('text', { class: 'splash', text: 'Press Space Bar', y: String(HEIGHT / 2) }),

    state === GameState.PAUSED &&
      s('text', { class: 'splash', text: 'Paused', y: String(HEIGHT / 2) }),

    state === GameState.COMPLETED &&
      s('text', { class: 'splash', text: 'Game Over', y: String(HEIGHT / 2) })
  )
}
