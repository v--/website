import { createComponent as c } from '../../../common/rendering/component.ts'
import { classlist } from '../../../common/support/dom_properties.ts'
import { BALL_RADIUS, PADDLE_HEIGHT, PADDLE_WIDTH, STAGE } from '../constants.ts'
import { findClosestIntersection, isIntersectionFatal } from '../intersection.ts'
import { type IBreakoutIntersection, type IGameState } from '../types.ts'

const MAX_GHOST_BALLS = 4

export function breakoutRay({ ball, paddle, bricks, debug, phase }: IGameState) {
  const trajectory: IBreakoutIntersection[] = []

  if (!debug) {
    return c.svg('g', { class: 'breakout-rays' })
  }

  if (phase !== 'game_over') {
    let int = findClosestIntersection(ball, paddle, bricks)

    for (let i = 0; i < MAX_GHOST_BALLS && int; i++) {
      trajectory.push(int)

      if (isIntersectionFatal(int)) {
        break
      }

      const newBall = int.calculateBallReflection()
      int = findClosestIntersection(newBall, paddle, bricks)
    }
  }

  return c.svg('g', { class: 'breakout-rays' },
    c.svg('ellipse', {
      class: 'breakout-rays-paddle',
      cx: String(paddle.center),
      cy: String(STAGE.getBottomPos()),
      rx: String(PADDLE_WIDTH + BALL_RADIUS),
      ry: String(PADDLE_HEIGHT + BALL_RADIUS),
    }),
    ...bricks.map(brick => {
      return c.svg('rect', {
        class: 'breakout-rays-brick',
        width: brick.bounds.width,
        height: brick.bounds.height,
        x: brick.bounds.getLeftPos(),
        y: brick.bounds.getTopPos(),
      })
    }),
    c.svg('polyline', {
      class: 'breakout-rays-edges',
      points: `${ball.center.x},${ball.center.y} ` + trajectory.map(({ newCenter }) => `${newCenter.x},${newCenter.y}`).join(' '),
    }),
    ...trajectory.map(int => {
      return c.svg('circle', {
        class: classlist('breakout-rays-ghost', isIntersectionFatal(int) && 'breakout-rays-ghost-fatal'),
        cx: String(int.newCenter.x),
        cy: String(int.newCenter.y),
        r: BALL_RADIUS,
      })
    }),
  )
}
