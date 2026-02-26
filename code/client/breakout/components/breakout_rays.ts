import { type Vec2D } from '../../../common/math/geom2d.ts'
import { createComponent as c } from '../../../common/rendering/component.ts'
import { classlist } from '../../../common/support/dom_properties.ts'
import { BALL_RADIUS, PADDLE_HEIGHT, PADDLE_WIDTH, STAGE } from '../constants.ts'
import { type BreakoutBrick } from '../geom/brick.ts'
import { isIntersectionFatal } from '../geom/intersection.ts'
import { type BreakoutPaddle } from '../geom/paddle.ts'
import { type IBreakoutTrajectory } from '../geom/trajectory.ts'

export interface IBreakoutRaysState {
  debug: boolean
  paddle: BreakoutPaddle
  ballCenter: Vec2D
  bricks: BreakoutBrick[]
  trajectory: IBreakoutTrajectory
}

export function breakoutRays({ debug, ballCenter, trajectory, paddle, bricks }: IBreakoutRaysState) {
  if (!debug) {
    return c.svg('g', { class: 'breakout-rays' })
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
      points: `${ballCenter.x},${ballCenter.y} ` + trajectory.tail.map(({ newCenter }) => `${newCenter.x},${newCenter.y}`).join(' '),
    }),
    ...trajectory.tail.map(int => {
      return c.svg('circle', {
        class: classlist('breakout-rays-ghost', isIntersectionFatal(int) && 'breakout-rays-ghost-fatal'),
        cx: String(int.newCenter.x),
        cy: String(int.newCenter.y),
        r: BALL_RADIUS,
      })
    }),
  )
}
