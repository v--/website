import { s } from '../../../common/support/svg.js'

import GameStatus from '../enums/game_status.js'
import { CHALK_COLORS } from '../../core/support/colors.js'

function getSplashMessage (status) {
  switch (status) {
    case GameStatus.PAUSED:
      return 'Paused'

    case GameStatus.UNSTARTED:
      return 'Ready to Start'

    case GameStatus.GAME_OVER:
      return 'Game Over'

    case GameStatus.COMPLETED:
      return 'Completed'

    default:
      return null
  }
}

export default function breakout ({ status, score, stage, paddle, ball, bricks }) {
  const splash = getSplashMessage(status)
  const viewBox = [-stage.size.x / 2, 0, stage.size.x, stage.size.y].join(' ')

  return s(
    'svg',
    {
      class: 'breakout',
      viewBox: viewBox
    },

    s('g', { class: 'bricks' }, ...bricks.map(function (brick) {
      return s('rect', {
        class: 'brick',
        width: '1',
        height: '1',
        x: String(brick.origin.x),
        y: String(brick.origin.y),
        fill: CHALK_COLORS[brick.power],
        stroke: CHALK_COLORS[brick.power]
      })
    })),

    s('ellipse', { class: 'paddle', cx: String(paddle.center.x), cy: String(paddle.center.y), rx: String(paddle.axes.x), ry: String(paddle.axes.y) }),
    s('circle', { class: 'ball', cx: String(ball.center.x), cy: String(ball.center.y), r: String(ball.radius) }),
    s('text', { class: 'score', text: `Score: ${score}`, x: '-9.5', y: '1' }),

    splash !== null &&
      s('text', { class: 'splash', text: getSplashMessage(status), y: String(stage.size.y / 2) }),

    splash !== null &&
      s('text', { class: 'subsplash', text: 'Press Space Bar', y: String(stage.size.y / 2 + 2) })
  )
}
