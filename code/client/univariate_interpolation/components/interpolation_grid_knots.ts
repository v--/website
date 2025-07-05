import { type KnotMapping } from '../../../common/math/numeric.ts'
import { s } from '../../../common/rendering/component.ts'

interface IInterpolationGridMappingState {
  knots: KnotMapping
}

const MAPPING_POINT_RADIUS = 0.2

export function interpolationGridKnots({ knots }: IInterpolationGridMappingState) {
  return s('g', { class: 'interpolation-grid-knots' },
    // TODO: Remove Array.from once Iterator.prototype.map() proliferates
    ...Array.from(knots.iterEntries()).map(
      ({ x, y }) => s('circle', {
        r: MAPPING_POINT_RADIUS,
        class: 'interpolation-grid-knots-point',
        cx: x,
        cy: y,
      }),
    ),
  )
}
