import { type IFreePulseWave, type IPulseCycle, type IPulseWave } from './types.ts'
import { randTriangular } from '../../common/math/prob.ts'
import { type float64 } from '../../common/types/numbers.ts'

/*
 * A single pulse "complex" in our simulation has the following "PQRSTU" structure:
 * |           R               |
 * |           ^               |
 * |    _     | |     _        |    _
 * |___/ \___ | | ___/ \___^___|___/ \
 * |    P    \| |/    T    U   |    P
 * |          Q S              |
 */

interface IPulseWaveGenerationConfig {
  amplitudeMean: float64
  amplitudeSD: float64
  durationMean: float64
  durationSD: float64
  offsetMean: float64
  offsetSD: float64
}

const WAVE_GENERATION_PARAMS: Record<string, IPulseWaveGenerationConfig> = {
  p: { durationMean: 0.100, durationSD: 0.005, amplitudeMean: 0.100, amplitudeSD: 0.020, offsetMean: 0.150, offsetSD: 0.015 },
  q: { durationMean: 0.050, durationSD: 0.005, amplitudeMean: 0.100, amplitudeSD: 0.030, offsetMean: 0.150, offsetSD: 0.015 },
  r: { durationMean: 0.025, durationSD: 0.005, amplitudeMean: 0.350, amplitudeSD: 0.040, offsetMean: 0.000, offsetSD: 0.000 },
  s: { durationMean: 0.050, durationSD: 0.005, amplitudeMean: 0.100, amplitudeSD: 0.025, offsetMean: 0.000, offsetSD: 0.000 },
  t: { durationMean: 0.100, durationSD: 0.010, amplitudeMean: 0.100, amplitudeSD: 0.030, offsetMean: 0.150, offsetSD: 0.015 },
  u: { durationMean: 0.050, durationSD: 0.005, amplitudeMean: 0.030, amplitudeSD: 0.020, offsetMean: 0.150, offsetSD: 0.015 },
}

/**
 * Generate a random value from a distribution with a given mean and standard deviation.
 * We initially used the normal distribution, but its unboundedness occasionally caused some glitches,
 * so the next simplest thing was to use a triangular distribution.
 *
 * We adjust parameters based on the desired mean and standard deviation.
 */
function randVariate(mean: float64, sd: float64): float64 {
  const r = Math.sqrt(6) * sd
  return randTriangular(mean - r, mean + r, mean)
}

function generateFreePulseWave(config: IPulseWaveGenerationConfig, durationScale: float64): IFreePulseWave {
  return {
    amplitude: randVariate(config.amplitudeMean, config.amplitudeSD),
    duration: durationScale * randVariate(config.durationMean, config.durationSD),
  }
}

function generatePulseWave(config: IPulseWaveGenerationConfig, durationScale: float64): IPulseWave {
  return {
    ...generateFreePulseWave(config, durationScale),
    offset: randVariate(config.offsetMean, config.offsetSD) * durationScale,
  }
}

export function simulatePulseCycle(durationScale: float64): IPulseCycle {
  const p = generatePulseWave(WAVE_GENERATION_PARAMS.p, durationScale)
  const q = generateFreePulseWave(WAVE_GENERATION_PARAMS.q, durationScale)
  const r = generateFreePulseWave(WAVE_GENERATION_PARAMS.r, durationScale)
  const s = generateFreePulseWave(WAVE_GENERATION_PARAMS.s, durationScale)
  const t = generatePulseWave(WAVE_GENERATION_PARAMS.t, durationScale)
  const u = generatePulseWave(WAVE_GENERATION_PARAMS.u, durationScale)
  const qrs = {
    offset: randVariate(WAVE_GENERATION_PARAMS.q.offsetMean, WAVE_GENERATION_PARAMS.q.offsetSD) * durationScale,
    q, r, s,
  }

  const duration = (
    p.duration + p.offset +
    qrs.offset + q.duration + r.duration + s.duration +
    t.duration + t.offset +
    u.duration + u.offset
  )

  return { p, qrs, t, u, duration }
}
