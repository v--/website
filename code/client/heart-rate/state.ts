import { CYCLE_COUNT } from './constants.ts'
import { generatePulseComplex } from './simulation.ts'
import { type IControllableHrsState, type IInternalHrsState } from './types.ts'

export const DEFAULT_INTERNAL_HRS_STATE: IInternalHrsState = {
  pulse: Array.from({ length: CYCLE_COUNT }, () => generatePulseComplex()),
  offset: 0,
}

export const DEFAULT_CONTROLLABLE_HRS_STATE: IControllableHrsState = {
  running: true,
}
