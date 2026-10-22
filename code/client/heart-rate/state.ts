import { DEFAULT_HEART_RATE, DEFAULT_WINDOW_SIZE } from './constants.ts'
import { type IControllableHrsState, type IInternalHrsState } from './types.ts'
import { DEFAULT_FRAME_DURATION } from '../core/dom.ts'

export const DEFAULT_INTERNAL_HRS_STATE: IInternalHrsState = {
  pulse: [], // An initial pulse is initialized by the worker
  offset: 0,
  simulationRate: DEFAULT_HEART_RATE,
  frameDuration: DEFAULT_FRAME_DURATION,
}

export const DEFAULT_CONTROLLABLE_HRS_STATE: IControllableHrsState = {
  running: false,
  showLabels: true,
  targetRate: DEFAULT_HEART_RATE,
  windowSize: DEFAULT_WINDOW_SIZE,
}
