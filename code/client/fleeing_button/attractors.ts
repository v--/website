import {
  ATTRACTOR_EDGE_OFFSET,
  ATTRACTOR_INNER_OFFSET,
  MOUSE_DISTANCE_THRESHOLD,
  STAGE,
} from './constants.ts'
import { Vec2D } from '../../common/math/geom2d.ts'
import { schwartzMin } from '../../common/support/iteration.ts'

export function* iterateAttractors() {
  for (let x = STAGE.getLeftPos() + ATTRACTOR_EDGE_OFFSET; x <= STAGE.getRightPos() - ATTRACTOR_EDGE_OFFSET; x += ATTRACTOR_INNER_OFFSET) {
    for (let y = STAGE.getTopPos() + ATTRACTOR_EDGE_OFFSET; y <= STAGE.getBottomPos() - ATTRACTOR_EDGE_OFFSET; y += ATTRACTOR_INNER_OFFSET) {
      yield new Vec2D({ x, y })
    }
  }
}

export function adjustActiveAttractor(buttonPosition: Vec2D, mousePosition: Vec2D, activeAttractor?: Vec2D): Vec2D | undefined {
  if (activeAttractor && mousePosition.distanceTo(activeAttractor) > MOUSE_DISTANCE_THRESHOLD) {
    return activeAttractor
  }

  return schwartzMin(
    att => buttonPosition.distanceTo(att),
    iterateAttractors().filter(attractor => mousePosition.distanceTo(attractor) > MOUSE_DISTANCE_THRESHOLD),
  )
}
