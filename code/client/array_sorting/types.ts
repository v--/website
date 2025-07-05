import { type SortableArray } from './support/sortable_array.ts'
import { type IMathMLRootEntry } from '../../common/rich.ts'
import { type uint32 } from '../../common/types/numbers.ts'

export interface ISortingComparison {
  i: uint32
  j: uint32
  swapped: boolean
}

export const ARRAY_TEMPLATE_KINDS = ['ascending', 'descending', 'shuffled', 'grouped'] as const
export type ArrayTemplateKind = typeof ARRAY_TEMPLATE_KINDS[uint32]

export const SORTING_PHASES = ['unstarted', 'running', 'paused', 'completed'] as const
export type SortingPhase = typeof SORTING_PHASES[uint32]

export type AlgorithmId = string

export interface ISortingTimelineSnapshot {
  array: uint32[]
  action?: ISortingComparison
}

export interface IGlobalSortingState {
  speed: uint32
  [momentKey: `moment_${AlgorithmId}`]: uint32
  [phaseKey: `phase_${AlgorithmId}`]: SortingPhase
}

export interface ISortingAlgorithm {
  id: AlgorithmId
  implementationDate: string
  isStable: boolean
  timeComplexity: IMathMLRootEntry
  spaceComplexity: IMathMLRootEntry
  sort(list: SortableArray): void
}
