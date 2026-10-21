import { type IControllableHrsState, type IInternalHrsState } from './types.js'

export interface HostStateUpdateMessage {
  kind: 'stateUpdate'
  update: Partial<IControllableHrsState>
}

export type HostToWorkerMessage = HostStateUpdateMessage

export interface WorkerStateUpdateMessage {
  kind: 'stateUpdate'
  update: Partial<IInternalHrsState>
}

export type WorkerToHostMessage = WorkerStateUpdateMessage
