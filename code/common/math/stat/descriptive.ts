import { EmptyIterError, sort } from '../../support/iteration.ts'
import { type float64, type uint32 } from '../../types/numbers.ts'

export function calcDifferences(iter: Iterable<float64>): float64[] {
  let lastValue: float64 | undefined = undefined
  const result = []

  for (const value of iter) {
    if (lastValue !== undefined) {
      result.push(value - lastValue)
    }

    lastValue = value
  }

  return result
}

export function calcMean(iter: Iterable<float64>): float64 {
  let sum = 0.0
  let length = 0

  for (const value of iter) {
    sum += value
    length++
  }

  if (length === 0) {
    return 0.0
  }

  return sum / length
}

export function calcStdDev(iter: Iterable<float64>, correction: uint32 = 1): float64 {
  const array = Array.from(iter)
  const m = calcMean(array)

  if (array.length < 2) {
    return 0.0
  }

  let sse = 0.0

  for (const value of iter) {
    sse += (value - m) ** 2
  }

  return Math.sqrt(sse / (array.length - correction))
}

export function calcQuantile(iter: Iterable<float64>, quantile: float64): float64 {
  const ordered = sort(iter)

  if (ordered.length === 0) {
    throw new EmptyIterError('Cannot find quantiles of an empty collection')
  }

  if (ordered.length === 1) {
    return ordered[0]
  }

  const quantileIndex = ordered.length * quantile

  if (Number.isInteger(quantileIndex)) {
    return ordered[quantileIndex]
  } else {
    const ceil = Math.ceil(quantileIndex)
    const floor = Math.floor(quantileIndex)

    if (ceil === ordered.length) {
      return ordered[floor]
    }

    return ordered[floor] + (ordered[ceil] - ordered[floor]) * (quantileIndex - floor)
  }
}
