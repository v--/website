import { Curve } from './curve.js'
import { Fitter } from './fitter.js'

export interface CurveFittingState {
  width: Num.UInt32,
  height: Num.UInt32,
  mapping: Map<Num.Float64, Num.Float64>,
  fitters: Set<Fitter>,
  curves: Curve[],
  updateMapping(x: Num.Float64, y: Num.Float64): void,
  deleteMapping(x: Num.Float64): void,
  enableFitter(fitter: Fitter): void,
  disableFitter(fitter: Fitter): void
}
