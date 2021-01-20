import { s } from '../../../common/support/svg.js'

const BRICK_VISUAL_PADDING = 0.01
const BRICK_VISUAL_SIZE_STRING = String(1 - 2 * BRICK_VISUAL_PADDING)

/**
 * @param {TBreakout.GameStatus} status
 */
function getSplashMessage(status) {
  switch (status) {
    case 'paused':
      return 'Paused'

    case 'unstarted':
      return 'Ready to Start'

    case 'gameOver':
      return 'Game Over'

    case 'completed':
      return 'Completed'
  }
}

/**
 * @param {import('../game_state.js').IGameState} state
 */
export function breakout({ status, score, stage, paddle, ball, bricks }) {
  const splash = getSplashMessage(status)
  const viewBox = [-stage.dims.x / 2, 0, stage.dims.x, stage.dims.y].join(' ')

  return s(
    'svg',
    {
      class: 'breakout',
      viewBox: viewBox
    },

    s('g', { class: 'bricks' }, ...bricks.map(function(brick) {
      return s('rect', {
        class: 'brick brick-' + brick.power,
        width: BRICK_VISUAL_SIZE_STRING,
        height: BRICK_VISUAL_SIZE_STRING,
        x: String(brick.origin.x + BRICK_VISUAL_PADDING),
        y: String(brick.origin.y + BRICK_VISUAL_PADDING)
      })
    })),

    s('ellipse', { class: 'paddle', cx: String(paddle.center.x), cy: String(paddle.center.y), rx: String(paddle.axes.x), ry: String(paddle.axes.y) }),
    s('circle', { class: 'ball', cx: String(ball.center.x), cy: String(ball.center.y), r: String(ball.radius) }),
    s('text', { class: 'score', text: `Score: ${score}`, x: '-9.5', y: '1' }),

    splash !== undefined &&
      s('text', { class: 'splash', text: getSplashMessage(status), y: String(stage.dims.y / 2) }),

    splash !== undefined &&
      s('text', { class: 'subsplash', text: 'Press Space Bar', y: String(stage.dims.y / 2 + 2) })
  )
}
