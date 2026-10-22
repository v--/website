import { type IControllableHrsState, type IInternalHrsState, type IPulseCycle } from './types.js'
import { type float64 } from '../../common/types/numbers.js'

export interface HostStateUpdateMessage {
  kind: 'stateUpdate'
  update: Partial<IControllableHrsState>
}

export type HostToWorkerMessage = HostStateUpdateMessage

export interface WorkerStateUpdateMessage {
  kind: 'stateUpdate'
  update: Partial<IInternalHrsState>
}

export interface CycleAtPeakMessage {
  kind: 'newRPoint'
  cycle: IPulseCycle
  timestamp: float64
}

export type WorkerToHostMessage = WorkerStateUpdateMessage | CycleAtPeakMessage
