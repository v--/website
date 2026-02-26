import { createComponent as c } from '../../../common/rendering/component.ts'
import { classlist } from '../../../common/support/dom_properties.ts'
import { getComputedState } from '../computed.ts'
import { BALL_RADIUS, PADDLE_HEIGHT, PADDLE_WIDTH, STAGE } from '../constants.ts'
import { findClosestIntersection, isIntersectionFatal } from '../geom/intersection.ts'
import { type IBreakoutIntersection, type IGameState } from '../types.ts'

const MAX_GHOST_BALLS = 4

export function breakoutRay(state: IGameState) {
  if (!state.debug) {
    return c.svg('g', { class: 'breakout-rays' })
  }

  const { ballTarget, paddle, bricks } = state
  const { ballCenter } = getComputedState(state)
  const trajectory: IBreakoutIntersection[] = []

  for (let i = 0, int: IBreakoutIntersection | undefined = ballTarget; i < MAX_GHOST_BALLS && int; i++) {
    trajectory.push(int)

    if (isIntersectionFatal(int)) {
      break
    }

    const refl = int.calculateReflectedDirection()
    int = findClosestIntersection(int.newCenter, refl, paddle, bricks)
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
      points: `${ballCenter.x},${ballCenter.y} ` + trajectory.map(({ newCenter }) => `${newCenter.x},${newCenter.y}`).join(' '),
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
