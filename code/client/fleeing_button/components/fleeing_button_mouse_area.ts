import { Vec2D } from '../../../common/math/geom2d.ts'
import { s } from '../../../common/rendering/component.ts'
import { MOUSE_DISTANCE_THRESHOLD } from '../constants.ts'

interface FleeingButtonRepellersState {
  mousePosition?: Vec2D
  activeAttractor?: Vec2D
  debug: boolean
}

export function fleeingButtonMouseArea({ mousePosition, debug }: FleeingButtonRepellersState) {
  return s('g', { class: 'fleeing-button-mouse-area-wrapper' },
    debug && mousePosition && s('circle', {
      class: 'fleeing-button-mouse-area',
      cx: mousePosition.x,
      cy: mousePosition.y,
      r: MOUSE_DISTANCE_THRESHOLD,
    }),
  )
}
