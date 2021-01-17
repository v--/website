import { Curve } from './curve.js'
import { Fitter } from './fitter.js'

export interface CurveFittingState {
  width: uint32,
  height: uint32,
  mapping: Map<float64, float64>,
  fitters: Set<Fitter>,
  curves: Curve[],
  updateMapping(x: float64, y: float64): void,
  deleteMapping(x: float64): void,
  enableFitter(fitter: Fitter): void,
  disableFitter(fitter: Fitter): void
}
