import { type IPlainVec2D } from '../../../common/math/geom2d.ts'
import { createComponent as c } from '../../../common/rendering/component.ts'
import { classlist } from '../../../common/support/dom-properties.ts'
import { type float64 } from '../../../common/types/numbers.ts'
import { BALL_RADIUS, PADDLE_HEIGHT, PADDLE_TRACE_WIDTH_CORRECTION, PADDLE_WIDTH } from '../constants.ts'
import { STAGE } from '../geom/stage.ts'
import { type IBreakoutTrajectory, type IBrickState } from '../types.ts'

export interface IBreakoutTraceState {
  debug: boolean
  paddleCenter: float64
  ballCenter: IPlainVec2D
  bricks: IBrickState[]
  trajectory: IBreakoutTrajectory
}

export function breakoutTrace({ debug, ballCenter, trajectory, paddleCenter, bricks }: IBreakoutTraceState) {
  if (!debug) {
    return c.svg('g', { class: 'breakout-trace' })
  }

  return c.svg('g', { class: 'breakout-trace' },
    c.svg('ellipse', {
      class: 'breakout-trace-paddle',
      cx: String(paddleCenter),
      cy: String(STAGE.getBottomPos()),
      rx: String(PADDLE_WIDTH + PADDLE_TRACE_WIDTH_CORRECTION * BALL_RADIUS),
      ry: String(PADDLE_HEIGHT + BALL_RADIUS),
    }),
    ...bricks.map(brickState => {
      return c.svg('rect', {
        class: 'breakout-trace-brick',
        width: 1 + 2 * BALL_RADIUS,
        height: 1 + 2 * BALL_RADIUS,
        x: brickState.x - BALL_RADIUS,
        y: brickState.y - BALL_RADIUS,
      })
    }),
    c.svg('polyline', {
      class: 'breakout-trace-edges',
      points: `${ballCenter.x},${ballCenter.y} ` + trajectory.tail.map(({ newCenter }) => `${newCenter.x},${newCenter.y}`).join(' '),
    }),
    ...trajectory.tail.map(int => {
      return c.svg('circle', {
        class: classlist(
          'breakout-trace-ghost',
          int.isStageBottom && 'breakout-trace-ghost-fatal',
          int.isLastHit && 'breakout-trace-ghost-winning',
        ),
        cx: String(int.newCenter.x),
        cy: String(int.newCenter.y),
        r: BALL_RADIUS,
      })
    }),
  )
}
