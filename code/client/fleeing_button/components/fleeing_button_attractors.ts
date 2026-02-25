import { Vec2D } from '../../../common/math/geom2d.ts'
import { createComponent as c } from '../../../common/rendering/component.ts'
import { classlist } from '../../../common/support/dom_properties.ts'
import { iterateAttractors } from '../attractors.ts'

interface FleeingButtonAttractorsState {
  activeAttractor?: Vec2D
  debug: boolean
}

const ATTRACTOR_VISIBLE_RADIUS = 0.025

export function fleeingButtonAttractors({ activeAttractor, debug }: FleeingButtonAttractorsState) {
  if (!debug) {
    return c.svg('g', { class: 'fleeing-button-attractors' })
  }

  return c.svg('g', { class: 'fleeing-button-attractors' },
    ...iterateAttractors().map(
      attractor => c.svg('circle', {
        class: classlist(
          'fleeing-button-attractor',
          activeAttractor && activeAttractor.coincidesWith(attractor) && 'fleeing-button-attractor-active',
        ),
        cx: attractor.x,
        cy: attractor.y,
        r: ATTRACTOR_VISIBLE_RADIUS,
      }),
    ),
  )
}
