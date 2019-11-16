import { martiniSort } from './algorithms/martini.js'
import { gnomeSort } from './algorithms/gnome.js'
import { quicksort } from './algorithms/quicksort.js'
import { heapsort } from './algorithms/heap.js'
import { shellSort } from './algorithms/shell.js'
import { mergeSort } from './algorithms/merge.js'
import { bubbleSort } from './algorithms/bubble.js'
import { selectionSort } from './algorithms/selection.js'
import { insertionSort } from './algorithms/insertion.js'

export const algorithms = Object.freeze([
  martiniSort,
  gnomeSort,
  quicksort,
  heapsort,
  shellSort,
  mergeSort,
  bubbleSort,
  selectionSort,
  insertionSort
])
