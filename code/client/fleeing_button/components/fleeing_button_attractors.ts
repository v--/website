import { Vec2D } from '../../../common/math/geom2d.ts'
import { s } from '../../../common/rendering/component.ts'
import { classlist } from '../../../common/support/dom_properties.ts'
import { map } from '../../../common/support/iteration.ts'
import { iterateAttractors } from '../attractors.ts'

interface FleeingButtonAttractorsState {
  activeAttractor?: Vec2D
  debug: boolean
}

const ATTRACTOR_VISIBLE_RADIUS = 0.025

export function fleeingButtonAttractors({ activeAttractor, debug }: FleeingButtonAttractorsState) {
  if (!debug) {
    return s('g', { class: 'fleeing-button-attractors' })
  }

  return s('g', { class: 'fleeing-button-attractors' },
    ...map(
      attractor => s('circle', {
        class: classlist(
          'fleeing-button-attractor',
          activeAttractor && activeAttractor.coincidesWith(attractor) && 'fleeing-button-attractor-active',
        ),
        cx: attractor.x,
        cy: attractor.y,
        r: ATTRACTOR_VISIBLE_RADIUS,
      }),
      iterateAttractors(),
    ),
  )
}
