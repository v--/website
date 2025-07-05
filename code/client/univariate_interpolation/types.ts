import { type ISymbolicFunction } from '../../common/math/numeric/types.ts'
import { type KnotMapping } from '../../common/math/numeric.ts'
import { type float64 } from '../../common/types/numbers.ts'

export type InterpolatorId = string

export interface IInterpolator {
  id: InterpolatorId
  implementationDate: string
  visibleByDefault: boolean
  interpolate(knots: KnotMapping): ISymbolicFunction<float64>
}

export interface IInterpolatedFunction {
  fun: ISymbolicFunction<float64>
  interpolator: IInterpolator
}

export interface IInterpolationState {
  knots: KnotMapping
  interpolated: IInterpolatedFunction[]
  visible: Record<InterpolatorId, boolean>
}
