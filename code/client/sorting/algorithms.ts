import { heapsort } from './algorithms/heapsort.js'
import { quicksort } from './algorithms/quicksort.js'
import { mergeSort } from './algorithms/merge.js'
import { shellsort } from './algorithms/shellsort.js'
import { insertionSort } from './algorithms/insertion.js'
import { selectionSort } from './algorithms/selection.js'
import { gnomeSort } from './algorithms/gnome.js'
import { martiniSort } from './algorithms/martini.js'
import { bubbleSort } from './algorithms/bubble.js'
import { SortAlgorithm } from './types/sort_algorithm.js'

export const algorithms: readonly SortAlgorithm[] = Object.freeze([
  heapsort,
  quicksort,
  mergeSort,
  shellsort,
  insertionSort,
  selectionSort,
  gnomeSort,
  martiniSort,
  bubbleSort
])
