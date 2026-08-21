import {
  ATTRACTOR_MAJOR_AXIS,
  ATTRACTOR_MINOR_AXIS,
  ATTRACTOR_RING_POINTS,
  MOUSE_DISTANCE_THRESHOLD,
} from './constants.ts'
import { Vec2D } from '../../common/math/geom2d.ts'
import { schwartzMin } from '../../common/support/iteration.ts'

function* iterateAttractors() {
  for (let angle = 0; angle < 2 * Math.PI; angle += 2 * Math.PI / ATTRACTOR_RING_POINTS) {
    yield new Vec2D({
      x: ATTRACTOR_MAJOR_AXIS * Math.cos(angle),
      y: ATTRACTOR_MINOR_AXIS * Math.sin(angle),
    })
  }
}

export const ATTRACTORS = Array.from(iterateAttractors())

export function adjustActiveAttractor(buttonPosition: Vec2D, mousePosition: Vec2D, activeAttractor?: Vec2D): Vec2D | undefined {
  if (activeAttractor && mousePosition.distanceTo(activeAttractor) > MOUSE_DISTANCE_THRESHOLD) {
    return activeAttractor
  }

  return schwartzMin(
    att => buttonPosition.distanceTo(att),
    ATTRACTORS.filter(attractor => mousePosition.distanceTo(attractor) > MOUSE_DISTANCE_THRESHOLD),
  )
}
