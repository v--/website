import { BinaryHeap } from '../../containers/binary_heap.js'

export function constructShortestPathAncestorMap (graph, start = 0) {
  const ancestors = new Map()
  const queue = new BinaryHeap()
  queue.insert(start, 0)

  while (!queue.isEmpty) {
    const min = queue.pop()

    for (const arc of graph.getOutcomingArcs(min.item)) {
      const newLen = min.weight + arc.weight

      if (queue.hasItem(arc.dest)) {
        if (newLen < queue.getItemWeight(arc.dest)) {
          queue.updateItemWeight(arc.dest, newLen)
          ancestors.set(arc.dest, min.item)
        }
      } else if (!ancestors.has(arc.dest)) {
        queue.insert(arc.dest, newLen)
        ancestors.set(arc.dest, min.item)
      }
    }
  }

  return ancestors
}
