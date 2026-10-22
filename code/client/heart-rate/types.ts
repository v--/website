import { type float64, type uint32 } from '../../common/types/numbers.ts'

export interface IFreePulseWave {
  amplitude: float64
  duration: float64
}

export interface IPulseWave extends IFreePulseWave {
  offset: float64
}

export interface IPQRComplex {
  offset: float64
  q: IFreePulseWave
  r: IFreePulseWave
  s: IFreePulseWave
}

export interface IPulseCycle {
  p: IPulseWave
  qrs: IPQRComplex
  t: IPulseWave
  u: IPulseWave
  duration: float64
}

export interface IInternalHrsState {
  pulse: IPulseCycle[]
  offset: float64
  simulationRate: float64
  frameDuration: float64
  nextPeakCycle?: IPulseCycle
}

export interface IControllableHrsState {
  running: boolean
  showLabels: boolean
  targetRate: uint32
  windowSize: uint32
}
