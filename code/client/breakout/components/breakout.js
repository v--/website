import { s } from '../../../common/support/svg.js'

import GameState from '../enums/game_state.js'

export default function breakout ({ width, height, paddleWidth, paddleX, state }) {
  const viewBox = [-width / 2, 0, width, height]
  const splashY = height / 2

  return s(
    'svg',
    {
      class: 'breakout',
      viewBox: viewBox.join(' ')
    },

    s('ellipse', { cx: String(paddleX), cy: '15', rx: String(paddleWidth), ry: '0.5' }),

    state === GameState.UNSTARTED &&
      s('text', { class: 'splash', text: 'Press Space Bar', y: String(splashY) }),

    state === GameState.PAUSED &&
      s('text', { class: 'splash', text: 'Paused', y: String(splashY) }),

    state === GameState.COMPLETED &&
      s('text', { class: 'splash', text: 'Game Over', y: String(splashY) })
  )
}
