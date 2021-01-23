import { sort } from '../../../common/support/iteration.js'

/**
 * @param {TCurveFitting.NumericMapping} mapping
 * @returns {TNum.Float64[]}
 */
export function getMappingDomain(mapping) {
  return sort(mapping.keys())
}

/**
 * @param {TCurveFitting.NumericMapping} mapping
 * @returns {TNum.Float64[]}
 */
export function getMappingRange(mapping) {
  return getMappingDomain(mapping).map(x => /** @type {TNum.Float64} */ (mapping.get(x)))
}
