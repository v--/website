import { type ISymbolicFunction } from '../../../common/math/numeric.ts'
import { s } from '../../../common/rendering/component.ts'
import { map, range } from '../../../common/support/iteration.ts'
import { join, snakeToKebabCase } from '../../../common/support/strings.ts'
import { type float64 } from '../../../common/types/numbers.ts'
import { CURVE_RESOLUTION, STAGE } from '../constants.ts'
import { type IInterpolatedFunction, type InterpolatorId } from '../types.ts'

interface IInterpolationGridCurveState {
  interpolated: IInterpolatedFunction[]
  visible: Record<InterpolatorId, boolean>
}

export function interpolationGridCurves({ interpolated, visible }: IInterpolationGridCurveState) {
  return s('g', { class: 'interpolation-grid-curves' },
    ...map(
      ({ fun, interpolator }) => visible[interpolator.id] && s('polyline', {
        class: `interpolation-grid-curve interpolator-${snakeToKebabCase(interpolator.id)}`,
        points: join(iterPolylinePoints(fun), ' '),
      }),
      interpolated,
    ),
  )
}

function* iterPolylinePoints(fun: ISymbolicFunction<float64>): Generator<string> {
  for (const x of range(STAGE.getLeftPos(), STAGE.getRightPos(), CURVE_RESOLUTION)) {
    yield `${x},${fun.eval(x)}`
  }
}
