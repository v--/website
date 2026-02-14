import { createComponent as c } from '../../../common/rendering/component.ts'
import { classlist } from '../../../common/support/dom_properties.ts'
import { BALL_RADIUS } from '../constants.ts'
import { isIntersectionFatal, tryFindClosestIntersection } from '../intersection.ts'
import { type IBreakoutIntersection, type IGameState } from '../types.ts'

const MAX_GHOST_BALLS = 4

export function breakoutRay({ ball, paddle, bricks, debug }: IGameState) {
  const trajectory: IBreakoutIntersection[] = []

  if (debug) {
    let int = tryFindClosestIntersection(ball, paddle, bricks)

    for (let i = 0; i < MAX_GHOST_BALLS && int; i++) {
      trajectory.push(int)

      if (isIntersectionFatal(int)) {
        break
      }

      const newBall = int.calculateBallReflection()
      int = tryFindClosestIntersection(newBall, paddle, bricks)
    }
  }

  return c.svg('g', { class: 'breakout-rays' },
    c.svg('polyline', {
      class: 'breakout-ray',
      points: `${ball.center.x},${ball.center.y} ` + trajectory.map(({ point }) => `${point.x},${point.y}`).join(' '),
    }),
    ...trajectory.map(breakoutBallGhost),
  )
}

function breakoutBallGhost(int: IBreakoutIntersection) {
  return c.svg('circle', {
    class: classlist('breakout-rays-ball-ghost', isIntersectionFatal(int) && 'breakout-rays-ball-ghost-fatal'),
    cx: String(int.point.x),
    cy: String(int.point.y),
    r: BALL_RADIUS,
  })
}
