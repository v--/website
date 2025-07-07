import { type KnotMapping } from '../../../common/math/numeric.ts'
import { createComponent as c } from '../../../common/rendering/component.ts'

interface IInterpolationGridMappingState {
  knots: KnotMapping
}

const MAPPING_POINT_RADIUS = 0.2

export function interpolationGridKnots({ knots }: IInterpolationGridMappingState) {
  return c.svg('g', { class: 'interpolation-grid-knots' },
    // TODO: Remove Array.from once Iterator.prototype.map() proliferates
    ...Array.from(knots.iterEntries()).map(
      ({ x, y }) => c.svg('circle', {
        r: MAPPING_POINT_RADIUS,
        class: 'interpolation-grid-knots-point',
        cx: x,
        cy: y,
      }),
    ),
  )
}
