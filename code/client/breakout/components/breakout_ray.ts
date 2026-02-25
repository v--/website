import { createComponent as c } from '../../../common/rendering/component.ts'
import { classlist } from '../../../common/support/dom_properties.ts'
import { BALL_RADIUS } from '../constants.ts'
import { isIntersectionFatal, tryFindClosestIntersection } from '../intersection.ts'
import { type IBreakoutIntersection, type IGameState } from '../types.ts'

const MAX_GHOST_BALLS = 4

export function breakoutRay({ ball, paddle, bricks, debug, phase }: IGameState) {
  const trajectory: IBreakoutIntersection[] = []

  if (debug && phase !== 'game_over') {
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
      class: 'breakout-rays-edges',
      points: `${ball.center.x},${ball.center.y} ` + trajectory.map(({ point }) => `${point.x},${point.y}`).join(' '),
    }),
    ...trajectory.map(breakoutBallGhost),
  )
}

function breakoutBallGhost(int: IBreakoutIntersection) {
  return c.svg('circle', {
    class: classlist('breakout-rays-ghost', isIntersectionFatal(int) && 'breakout-rays-ghost-fatal'),
    cx: String(int.point.x),
    cy: String(int.point.y),
    r: BALL_RADIUS,
  })
}
