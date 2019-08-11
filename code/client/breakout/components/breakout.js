import { s } from '../../../common/support/svg.js'

import GameState from '../enums/game_state.js'
import { GAME_SIZE, PADDLE_SIZE, BALL_RADIUS } from '../constants.js'
import { CHALK_COLORS } from '../../core/support/colors.js'

const VIEW_BOX = [-GAME_SIZE.x / 2, 0, GAME_SIZE.x, GAME_SIZE.y].join(' ')
const PADDLE_RX = String(PADDLE_SIZE.x)
const PADDLE_RY = String(PADDLE_SIZE.y)
const PADDLE_Y = String(GAME_SIZE.y)
const SPLASH_Y = String(GAME_SIZE.y / 2)
const SUBSPLASH_Y = String(GAME_SIZE.y / 2 + 2)
const SCORE_X = String(-GAME_SIZE.x / 2 + BALL_RADIUS)
const BALL_R = String(BALL_RADIUS)

function getSplashMessage (state) {
  switch (state) {
    case GameState.PAUSED:
      return 'Paused'

    case GameState.UNSTARTED:
      return 'Ready to Start'

    case GameState.GAME_OVER:
      return 'Game Over'

    case GameState.COMPLETED:
      return 'Completed'

    default:
      return null
  }
}

export default function breakout ({ state, paddleX, ball, bricks, score }) {
  const splash = getSplashMessage(state)

  return s(
    'svg',
    {
      class: 'breakout',
      viewBox: VIEW_BOX
    },

    s('g', { class: 'bricks' }, ...bricks.map(function (brick) {
      return s('rect', {
        class: 'brick',
        width: '1',
        height: '1',
        x: String(brick.x),
        y: String(brick.y),
        fill: CHALK_COLORS[brick.power]
      })
    })),

    s('ellipse', { class: 'paddle', cx: String(paddleX), cy: PADDLE_Y, rx: PADDLE_RX, ry: PADDLE_RY }),
    s('circle', { class: 'ball', cx: String(ball.x), cy: String(ball.y), r: BALL_R }),
    s('text', { class: 'score', text: `Score: ${score}`, x: SCORE_X, y: '1' }),

    splash !== null &&
      s('text', { class: 'splash', text: getSplashMessage(state), y: SPLASH_Y }),

    splash !== null &&
      s('text', { class: 'subsplash', text: 'Press Space Bar', y: SUBSPLASH_Y })
  )
}
