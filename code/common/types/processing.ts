import { DataFormatError } from '../errors'
import { repr } from '../support/strings.js'

export function processDatum<T>(processor: (data: Record<string, unknown>) => T | undefined) {
  return function(rawData: unknown) {
    if (!(rawData instanceof Object)) {
      throw new DataFormatError(`Expected ${repr(rawData)} to be an object`)
    }

    const result = processor(rawData as Record<string, unknown>)

    if (result === undefined) {
      throw new DataFormatError(`Data ${repr(rawData)} is in an incorrect format`)
    }

    return result
  }
}

export function processData<T>(processor: (data: Record<string, unknown>) => T | undefined) {
  return function(rawData: unknown) {
    if (!(rawData instanceof Array)) {
      throw new DataFormatError(`Expected ${repr(rawData)} to be an array`)
    }

    const datumProcessor = processDatum<T>(processor)
    const result = (rawData as unknown[]).map(datumProcessor)

    if (result.some(x => x === undefined)) {
      throw new DataFormatError(`Data ${repr(rawData)} is in an incorrect format`)
    }

    return result
  }
}
