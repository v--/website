import { DataFormatError } from '../errors'
import { repr } from '../support/strings.js'

/**
 * @template T
 * @param {(data: Record<string, unknown>) => T | undefined} processor
 */
export function processDatum(processor) {
  return /** @param {unknown} rawData */ function(rawData) {
    if (!(rawData instanceof Object)) {
      throw new DataFormatError(`Expected ${repr(rawData)} to be an object`)
    }

    const result = processor(/** @type {Record<string, unknown>} */ (rawData))

    if (result === undefined) {
      throw new DataFormatError(`Data ${repr(rawData)} is in an incorrect format`)
    }

    return result
  }
}

/**
 * @template T
 * @param {(data: Record<string, unknown>) => T | undefined} processor
 */
export function processData(processor) {
  return /** @param {unknown} rawData */ function(rawData) {
    if (!(rawData instanceof Array)) {
      throw new DataFormatError(`Expected ${repr(rawData)} to be an array`)
    }

    const datumProcessor = processDatum(processor)
    const result = (/** @type {unknown[]} */ (rawData)).map(datumProcessor)

    if (result.some(x => x === undefined)) {
      throw new DataFormatError(`Data ${repr(rawData)} is in an incorrect format`)
    }

    return result
  }
}
