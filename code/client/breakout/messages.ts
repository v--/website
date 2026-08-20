import { type IControllableGameState, type IInternalGameState } from './types.js'

export interface HostStateUpdateMessage {
  kind: 'stateUpdate'
  update: Partial<IControllableGameState>
}

export interface HostResetMessage {
  kind: 'reset'
}

export type HostToWorkerMessage = HostStateUpdateMessage | HostResetMessage

export interface WorkerStateUpdateMessage {
  kind: 'stateUpdate'
  update: Partial<IInternalGameState>
}

export interface WorkerGameOverMessage {
  kind: 'gameOver'
}

export interface WorkerGameCompletedMessage {
  kind: 'gameCompleted'
}

export type WorkerToHostMessage = WorkerStateUpdateMessage | WorkerGameOverMessage | WorkerGameCompletedMessage
