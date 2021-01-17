import { sort } from '../../../common/support/iteration.js'

export type NumericMapping = Map<float64, float64>

export function getMappingDomain(mapping: NumericMapping) {
  return sort(mapping.keys())
}

export function getMappingRange(mapping: NumericMapping) {
  return getMappingDomain(mapping).map(x => mapping.get(x)!)
}
