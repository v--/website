import { IRealFunction } from '../../../common/math/types/real_function'
import { ISODateString } from '../../../common/types/dates'

export interface Fitter {
  name: string,
  date: ISODateString
  hideByDefault?: boolean
  fit(mapping: Map<float64, float64>): IRealFunction
}
