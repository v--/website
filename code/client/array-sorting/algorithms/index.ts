import { type ISortingAlgorithm } from '../types.ts'
import { BUBBLE_SORT } from './bubble.ts'
import { COCKTAIL_SORT } from './cocktail.ts'
import { GNOME_SORT } from './gnome.ts'
import { HEAPSORT } from './heapsort.ts'
import { INSERTION_SORT } from './insertion.ts'
import { MERGE_SORT } from './merge.ts'
import { QUICKSORT } from './quicksort.ts'
import { SELECTION_SORT } from './selection.ts'
import { SHELLSORT } from './shellsort.ts'

export const ALGORITHMS: ISortingAlgorithm[] = [
  HEAPSORT,
  QUICKSORT,
  MERGE_SORT,
  SHELLSORT,
  INSERTION_SORT,
  SELECTION_SORT,
  GNOME_SORT,
  COCKTAIL_SORT,
  BUBBLE_SORT,
]
