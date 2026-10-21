import { type IFreePulseWave, type IPulseCycle, type IPulseWave } from './types.ts'
import { randNormal } from '../../common/math/prob/random.ts'
import { type float64 } from '../../common/types/numbers.ts'

/*
 * A single pulse "complex" in our simulation has the following "PQRSTU" structure:
 * |         R             |
 * |         |             |
 * |   _    / \    _       |   _
 * |__/ \__ | | __/ \__/\__|__/ \
 * |   P   \| |/   T   U   |   P
 * |        Q S            |
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
  p: { durationMean: 0.100, durationSD: 0.008, amplitudeMean: 0.100, amplitudeSD: 0.010, offsetMean: 0.150, offsetSD: 0.020 },
  q: { durationMean: 0.050, durationSD: 0.005, amplitudeMean: 0.100, amplitudeSD: 0.015, offsetMean: 0.150, offsetSD: 0.020 },
  r: { durationMean: 0.025, durationSD: 0.002, amplitudeMean: 0.350, amplitudeSD: 0.015, offsetMean: 0.000, offsetSD: 0.000 },
  s: { durationMean: 0.050, durationSD: 0.005, amplitudeMean: 0.100, amplitudeSD: 0.010, offsetMean: 0.000, offsetSD: 0.000 },
  t: { durationMean: 0.100, durationSD: 0.008, amplitudeMean: 0.100, amplitudeSD: 0.015, offsetMean: 0.150, offsetSD: 0.020 },
  u: { durationMean: 0.050, durationSD: 0.005, amplitudeMean: 0.025, amplitudeSD: 0.003, offsetMean: 0.150, offsetSD: 0.020 },
}

function generateFreePulseWave(config: IPulseWaveGenerationConfig): IFreePulseWave {
  return {
    amplitude: randNormal(config.amplitudeMean, config.amplitudeSD),
    duration: randNormal(config.durationMean, config.durationSD),
  }
}

function generatePulseWave(config: IPulseWaveGenerationConfig): IPulseWave {
  return {
    ...generateFreePulseWave(config),
    offset: randNormal(config.offsetMean, config.offsetSD),
  }
}

export function generatePulseComplex(): IPulseCycle {
  const p = generatePulseWave(WAVE_GENERATION_PARAMS.p)
  const q = generateFreePulseWave(WAVE_GENERATION_PARAMS.q)
  const r = generateFreePulseWave(WAVE_GENERATION_PARAMS.r)
  const s = generateFreePulseWave(WAVE_GENERATION_PARAMS.s)
  const t = generatePulseWave(WAVE_GENERATION_PARAMS.t)
  const u = generatePulseWave(WAVE_GENERATION_PARAMS.u)
  const qrs = {
    offset: randNormal(WAVE_GENERATION_PARAMS.q.offsetMean, WAVE_GENERATION_PARAMS.q.offsetSD),
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
