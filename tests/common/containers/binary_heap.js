import { describe, it, assert } from '../../_common.js'

import { EmptyHeapError, BinaryHeap } from '../../../code/common/containers/binary_heap.js'

describe('BinaryHeap', function () {
  describe('#peek()', function () {
    it('throws when trying to get the minimum element of an empty heap', function () {
      const heap = new BinaryHeap()

      assert.throws(function () {
        heap.peek()
      }, EmptyHeapError)
    })

    it('gets the minimum of a single element heap', function () {
      const heap = new BinaryHeap()
      heap.insert(1)
      assert.equal(heap.peek().weight, 1)
    })

    it('gets the minimum of a three-element heap', function () {
      const heap = new BinaryHeap()
      heap.insert(3)
      heap.insert(2)
      heap.insert(1)
      assert.equal(heap.peek().weight, 1)
    })
  })

  describe('#insert()', function () {
    it('inserts a single element correctly', function () {
      const heap = new BinaryHeap()
      heap.insert(1)
      heap.insert(2)
      assert.equal(heap.peek().weight, 1)
    })

    it('inserts multiple idential elements', function () {
      const heap = new BinaryHeap()
      heap.insert(1)
      heap.insert(1)
      assert.equal(heap.peek().weight, 1)
    })

    it('inserts multiple elements correctly when they are in order', function () {
      const heap = new BinaryHeap()
      heap.insert(1)
      heap.insert(2)
      assert.equal(heap.peek().weight, 1)
    })

    it('inserts multiple elements correctly when they are in reverse order', function () {
      const heap = new BinaryHeap()
      heap.insert(2)
      heap.insert(1)
      assert.equal(heap.peek().weight, 1)
    })
  })

  describe('#pop()', function () {
    it('throws when trying to pop an empty heap', function () {
      const heap = new BinaryHeap()

      assert.throws(function () {
        heap.pop()
      }, EmptyHeapError)
    })

    it('pops the minimum', function () {
      const heap = new BinaryHeap()
      heap.insert(1)
      assert.equal(heap.pop().item, 1)
      assert.isTrue(heap.isEmpty)
    })

    it('pops the same minimum multiple times', function () {
      const heap = new BinaryHeap()
      heap.insert(1)
      heap.insert(1)

      assert.equal(heap.pop().item, 1)
      assert.isFalse(heap.isEmpty)

      assert.equal(heap.pop().item, 1)
      assert.isTrue(heap.isEmpty)
    })

    it('preserves the heap property after multiple pops', function () {
      const heap = new BinaryHeap()

      heap.insert(3)
      heap.insert(2)
      heap.insert(1)

      assert.equal(heap.pop().item, 1)
      assert.equal(heap.pop().item, 2)
      assert.equal(heap.pop().item, 3)
    })
  })
})
