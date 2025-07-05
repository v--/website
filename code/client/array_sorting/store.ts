import { ALGORITHMS } from './algorithms.ts'
import { INITIAL_GLOBAL_STATE, INITIAL_MOMENT, INITIAL_PHASE } from './constants.ts'
import { type AlgorithmId, type IGlobalSortingState, type SortingPhase } from './types.ts'
import { type Observable, combineLatest, map } from '../../common/observable.ts'
import { StateStore } from '../../common/support/state_store.ts'
import { type uint32 } from '../../common/types/numbers.ts'

export class SortingFrameStore {
  #store: StateStore<IGlobalSortingState>
  globalSortingPhase$: Observable<SortingPhase>
  speed$: Observable<uint32>

  constructor(unload$: Observable<void>) {
    this.#store = new StateStore<IGlobalSortingState>(INITIAL_GLOBAL_STATE, unload$)
    this.speed$ = this.#store.keyedObservables.speed
    this.globalSortingPhase$ = combineLatest(ALGORITHMS.map(alg => this.getAlgorithmPhase$(alg.id))).pipe(
      map(phases => combineStatuses(phases)),
    )
  }

  resetAlgorithmState(algorithmId: AlgorithmId) {
    this.updateAlgorithmPhase(algorithmId, INITIAL_PHASE)
    this.updateAlgorithmMoment(algorithmId, INITIAL_MOMENT)
  }

  resetGlobalSortingState() {
    for (const alg of ALGORITHMS) {
      this.resetAlgorithmState(alg.id)
    }
  }

  getGlobalSortingPhase() {
    const phases = ALGORITHMS.map(alg => this.getAlgorithmPhase(alg.id))
    return combineStatuses(phases)
  }

  getAlgorithmPhase(algorithmId: AlgorithmId) {
    return this.#store.getState(`phase_${algorithmId}`)
  }

  getAlgorithmPhase$(algorithmId: AlgorithmId) {
    return this.#store.keyedObservables[`phase_${algorithmId}`]
  }

  updateAlgorithmPhase(algorithmId: AlgorithmId, phase: SortingPhase) {
    const currentPhase = this.getAlgorithmPhase(algorithmId)

    if (currentPhase !== 'completed' || phase !== 'running') {
      this.#store.setState(`phase_${algorithmId}`, phase)
    }
  }

  updateGlobalPhase(phase: SortingPhase) {
    for (const alg of ALGORITHMS) {
      this.updateAlgorithmPhase(alg.id, phase)
    }
  }

  getAlgorithmMoment(algorithmId: AlgorithmId) {
    return this.#store.getState(`moment_${algorithmId}`)
  }

  getAlgorithmMoment$(algorithmId: AlgorithmId) {
    return this.#store.keyedObservables[`moment_${algorithmId}`]
  }

  updateAlgorithmMoment(algorithmId: AlgorithmId, moment: uint32) {
    this.#store.setState(`moment_${algorithmId}`, moment)
  }

  updateSpeed(speed: uint32) {
    this.#store.setState('speed', speed)
  }
}

function combineStatuses(statuses: SortingPhase[]): SortingPhase {
  if (statuses.every(s => s === 'unstarted')) {
    return 'unstarted'
  }

  if (statuses.every(s => s === 'completed')) {
    return 'completed'
  }

  if (statuses.every(s => s !== 'running')) {
    return 'paused'
  }

  return 'running'
}
