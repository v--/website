import { IRealFunction } from '../../../common/math/types/real_function.js'
import { Fitter } from './fitter.js'

export interface Curve {
  fitter: Fitter
  curve: IRealFunction
  cssClass: string
}
