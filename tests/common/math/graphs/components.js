import { describe, it, assert } from '../../../_common.js'

import { mapToObject } from '../../../../code/common/support/maps.js'
import { Graph } from '../../../../code/common/math/graphs/graph.js'
import { labelComponents } from '../../../../code/common/math/graphs/components.js'

describe('labelComponents()', function() {
  it('creates zero labels for the null graph', function() {
    const graph = new Graph()
    const labels = labelComponents(graph)
    assert.deepEqual([...labels.entries()], [])
  })

  it('labels the single component of a graph with a single arc', function() {
    const graph = Graph.fromArcData([
      { src: 0, dest: 1 }
    ])

    const labels = labelComponents(graph)
    assert.deepEqual(mapToObject(labels), { 0: 0, 1: 0 })
  })

  it('labels the components of a forest', function() {
    const graph = Graph.fromArcData([
      { src: 0, dest: 1 },
      { src: 0, dest: 2 },
      { src: 3, dest: 4 },
      { src: 3, dest: 5 }
    ])

    const labels = labelComponents(graph)
    assert.deepEqual(mapToObject(labels), {
      0: 0,
      1: 0,
      2: 0,
      3: 1,
      4: 1,
      5: 1
    })
  })

  it('labels the components of a totally disconnected graph', function() {
    const graph = Graph.empty(3)

    const labels = labelComponents(graph)
    assert.deepEqual(mapToObject(labels), {
      0: 0,
      1: 1,
      2: 2
    })
  })
})
