import { type Vec2D } from '../../../common/math/geom2d.ts'
import { createComponent as c } from '../../../common/rendering/component.ts'
import { classlist } from '../../../common/support/dom_properties.ts'
import { isClose } from '../../../common/support/floating.ts'
import { schwartzMin } from '../../../common/support/iteration.ts'
import { BALL_CONTROL_POINT_ANGLES, BALL_RADIUS, STAGE } from '../constants.ts'
import { findClosestIntersection, reflectDirectionThroughIntersection } from '../intersection.ts'
import { type IGameState } from '../types.ts'

export function breakoutRays({ ballCenter, ballDirection, bricks, paddleCenter, debug }: IGameState) {
  const ballPoints: Vec2D[] = []

  if (debug) {
    for (const angle of BALL_CONTROL_POINT_ANGLES) {
      ballPoints.push(
        ballCenter.translate(ballDirection.rotate(angle), BALL_RADIUS),
      )
    }
  }
  const rayTrajectories = ballPoints.map(function (ballPoint) {
    const points = [ballPoint]
    const firstInt = findClosestIntersection(ballPoint, ballDirection, paddleCenter, bricks)

    if (firstInt) {
      points.push(firstInt.point)

      if (!isClose(firstInt.point.y, STAGE.getBottomPos())) {
        const reflectedDirection = reflectDirectionThroughIntersection(ballPoint, ballDirection, firstInt)
        const secondInt = findClosestIntersection(
          firstInt.point,
          reflectedDirection,
          paddleCenter,
          bricks,
        )

        if (secondInt && !isClose(firstInt.point.y, STAGE.getBottomPos())) {
          points.push(secondInt.point)
        }
      }
    }

    return points
  })

  const dominantTrajectory = rayTrajectories.length > 0 ?
      schwartzMin(
        traj => traj.length > 1 ? traj[1].distanceTo(traj[0]) : Number.POSITIVE_INFINITY,
        rayTrajectories,
      ) :
    undefined

  return c.svg('g', { class: 'breakout-rays' },
    ...rayTrajectories.map(function (trajectory, i) {
      return c.svg('polyline', {
        class: classlist('breakout-ray', `breakout-ray-${i + 1}`, trajectory === dominantTrajectory && 'breakout-ray-dominant'),
        points: trajectory.map(({ x, y }) => `${x},${y}`).join(' '),
      })
    }),
  )
}
