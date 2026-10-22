import { calcDifferences, calcMean, calcQuantile, calcStdDev } from '../../common/math/stat.ts'
import { type UnitRatio, type float64 } from '../../common/types/numbers.ts'

export function durationToHeartRate(duration: float64 | undefined): float64 | undefined {
  if (duration === undefined) {
    return undefined
  }

  return 60 * 1000 / duration
}

export function calcMeanHeartRate(rrIntervals: float64[]): float64 | undefined {
  if (rrIntervals.length === 0) {
    return undefined
  }

  return calcMean(rrIntervals)
}

export function calcMedianHeartRate(rrIntervals: float64[]): float64 | undefined {
  if (rrIntervals.length === 0) {
    return undefined
  }

  return calcQuantile(rrIntervals, 0.5)
}

export function calcSDRR(rrIntervals: float64[]): float64 | undefined {
  if (rrIntervals.length < 2) {
    return undefined
  }

  return calcStdDev(rrIntervals)
}

export function calcIQRRR(rrIntervals: float64[]): float64 | undefined {
  if (rrIntervals.length < 2) {
    return undefined
  }

  return calcQuantile(rrIntervals, 0.75) - calcQuantile(rrIntervals, 0.25)
}

export function calcRMSSD(rrIntervals: float64[]): float64 | undefined {
  if (rrIntervals.length < 2) {
    return undefined
  }

  return Math.sqrt(
    calcMean(calcDifferences(rrIntervals).map(d => d ** 2)),
  )
}

export function calcPNN(rrIntervals: float64[], maxDifference: float64): UnitRatio | undefined {
  if (rrIntervals.length < 2) {
    return undefined
  }

  return calcDifferences(rrIntervals).filter(d => d >= maxDifference).length / (rrIntervals.length - 1)
}
