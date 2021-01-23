import { heapsort } from './algorithms/heapsort.js'
import { quicksort } from './algorithms/quicksort.js'
import { mergeSort } from './algorithms/merge.js'
import { shellsort } from './algorithms/shellsort.js'
import { insertionSort } from './algorithms/insertion.js'
import { selectionSort } from './algorithms/selection.js'
import { gnomeSort } from './algorithms/gnome.js'
import { martiniSort } from './algorithms/martini.js'
import { bubbleSort } from './algorithms/bubble.js'

/** @type {readonly TSortVis.ISortAlgorithm[]} */
export const algorithms = Object.freeze([
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
