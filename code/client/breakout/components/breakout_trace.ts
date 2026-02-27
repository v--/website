import { type Vec2D } from '../../../common/math/geom2d.ts'
import { createComponent as c } from '../../../common/rendering/component.ts'
import { classlist } from '../../../common/support/dom_properties.ts'
import { BALL_RADIUS, PADDLE_HEIGHT, PADDLE_WIDTH, STAGE } from '../constants.ts'
import { type BreakoutBrick } from '../geom/brick.ts'
import { isIntersectionFatal } from '../geom/intersection.ts'
import { type BreakoutPaddle } from '../geom/paddle.ts'
import { type IBreakoutTrajectory } from '../geom/trajectory.ts'

export interface IBreakoutTraceState {
  debug: boolean
  paddle: BreakoutPaddle
  ballCenter: Vec2D
  bricks: BreakoutBrick[]
  trajectory: IBreakoutTrajectory
}

export function breakoutTrace({ debug, ballCenter, trajectory, paddle, bricks }: IBreakoutTraceState) {
  if (!debug) {
    return c.svg('g', { class: 'breakout-trace' })
  }

  return c.svg('g', { class: 'breakout-trace' },
    c.svg('ellipse', {
      class: 'breakout-trace-paddle',
      cx: String(paddle.center),
      cy: String(STAGE.getBottomPos()),
      rx: String(PADDLE_WIDTH + BALL_RADIUS),
      ry: String(PADDLE_HEIGHT + BALL_RADIUS),
    }),
    ...bricks.map(brick => {
      return c.svg('rect', {
        class: 'breakout-trace-brick',
        width: brick.bounds.width,
        height: brick.bounds.height,
        x: brick.bounds.getLeftPos(),
        y: brick.bounds.getTopPos(),
      })
    }),
    c.svg('polyline', {
      class: 'breakout-trace-edges',
      points: `${ballCenter.x},${ballCenter.y} ` + trajectory.tail.map(({ newCenter }) => `${newCenter.x},${newCenter.y}`).join(' '),
    }),
    ...trajectory.tail.map(int => {
      return c.svg('circle', {
        class: classlist('breakout-trace-ghost', isIntersectionFatal(int) && 'breakout-trace-ghost-fatal'),
        cx: String(int.newCenter.x),
        cy: String(int.newCenter.y),
        r: BALL_RADIUS,
      })
    }),
  )
}
