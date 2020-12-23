import { describe, it, assert } from '../../../_common.js'

import { Graph, GraphArc, GraphError } from '../../../../code/common/math/graphs/graph.js'

describe('Graph', function() {
  describe('#addArc()', function() {
    it('adds an arc to an empty graph', function() {
      const graph = new Graph()
      graph.addArc(new GraphArc({ src: 0, dest: 1 }))
      const arcs = graph.getAllArcs()

      assert.lengthOf(arcs, 1)
      assert.include(arcs[0], { src: 0, dest: 1 })
    })

    it('fails to add a duplicate arc', function() {
      const graph = new Graph()
      graph.addArc(new GraphArc({ src: 0, dest: 1 }))

      assert.throws(function() {
        graph.addArc(new GraphArc({ src: 0, dest: 1 }))
      }, GraphError)
    })
  })
})
