import { map } from '../../../common/observable.ts'
import { createComponent as c } from '../../../common/rendering/component.ts'
import { type StateStore } from '../../../common/support/state-store.ts'
import { type float64 } from '../../../common/types/numbers.ts'
import { type ClientWebsiteEnvironment } from '../../core/environment.ts'
import { SIMULATION_BOUNDS } from '../constants.ts'
import { type IControllableHrsState, type IInternalHrsState, type IPQRComplex, type IPulseWave } from '../types.ts'

interface IHeartRateStageState {
  internalStateStore: StateStore<IInternalHrsState>
  controllableStateStore: StateStore<IControllableHrsState>
}

const SVG_VIEW_BOX = [
  SIMULATION_BOUNDS.getLeftPos(),
  SIMULATION_BOUNDS.getTopPos(),
  SIMULATION_BOUNDS.width,
  SIMULATION_BOUNDS.height,
].join(' ')

export function heartRateSimulation({ internalStateStore }: IHeartRateStageState, _env: ClientWebsiteEnvironment) {
  return c.svg('svg',
    {
      class: 'heart-rate-simulation',
      viewBox: SVG_VIEW_BOX,
    },
    c.svg('polyline', {
      class: 'heart-rate-simulation-line',
      points: internalStateStore.combinedState$.pipe(
        map(sim => Array.from(iterSimulationPathCoordinates(sim)).join(' ')),
      ),
    }),
  )
}

function pointToPathCoord(x: float64, y: float64): string {
  return `${x.toPrecision(4)},${-y.toPrecision(4)}`
}

function* iterWavePath(wave: IPulseWave, offset: float64): Generator<string> {
  yield pointToPathCoord(offset + wave.offset, 0)
  yield pointToPathCoord(offset + wave.offset + wave.duration / 2, wave.amplitude)
  yield pointToPathCoord(offset + wave.offset + wave.duration, 0)
}

function* iterQRSComplexPath(complex: IPQRComplex, offset: float64): Generator<string> {
  yield pointToPathCoord(offset + complex.offset, 0)
  yield pointToPathCoord(offset + complex.offset + complex.q.duration / 2, -complex.q.amplitude)
  yield pointToPathCoord(offset + complex.offset + complex.q.duration + complex.r.duration / 2, complex.r.amplitude)
  yield pointToPathCoord(offset + complex.offset + complex.q.duration + complex.r.duration + complex.s.duration / 2, -complex.s.amplitude)
  yield pointToPathCoord(offset + complex.offset + complex.q.duration + complex.r.duration + complex.s.duration, 0)
}

function* iterSimulationPathCoordinates(sim: IInternalHrsState): Generator<string> {
  let globalOffset = sim.offset

  for (const cycle of sim.pulse) {
    let offset = globalOffset
    yield* iterWavePath(cycle.p, offset)
    offset += cycle.p.offset + cycle.p.duration
    yield* iterQRSComplexPath(cycle.qrs, offset)
    offset += cycle.qrs.offset + cycle.qrs.q.duration + cycle.qrs.r.duration + cycle.qrs.s.duration
    yield* iterWavePath(cycle.t, offset)
    offset += cycle.t.offset + cycle.t.duration
    yield* iterWavePath(cycle.u, offset)
    globalOffset += cycle.duration
  }
}
