import quicksort from './algorithms/quicksort.mjs'
import insertion from './algorithms/insertion.mjs'
import selection from './algorithms/selection.mjs'
import bubble from './algorithms/bubble.mjs'
import gnome from './algorithms/gnome.mjs'
import shell from './algorithms/shell.mjs'
import merge from './algorithms/merge.mjs'
import heap from './algorithms/heap.mjs'

export default Object.freeze([
  gnome,
  quicksort,
  heap,
  shell,
  merge,
  bubble,
  selection,
  insertion
])
