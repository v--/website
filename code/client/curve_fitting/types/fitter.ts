import { IRealFunction } from '../../../common/math/types/real_function.js'
import { ISODateString } from '../../../common/types/dates.js'
import { float64 } from '../../../common/types/numeric.js'

export interface Fitter {
  name: string,
  date: ISODateString
  hideByDefault?: boolean
  fit(mapping: Map<float64, float64>): IRealFunction
}
